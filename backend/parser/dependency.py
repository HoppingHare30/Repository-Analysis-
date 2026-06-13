import os
import re
import sys
from typing import List, Optional, Union

import tree_sitter
import tree_sitter_python
import tree_sitter_javascript

# Attempt to load tree-sitter C parser, fall back gracefully if versions mismatch
try:
    import tree_sitter_c
    C_LANGUAGE = tree_sitter.Language(tree_sitter_c.language())
    # Verify the language is compatible by instantiating a dummy parser
    _ = tree_sitter.Parser(C_LANGUAGE)
    HAS_C_PARSER = True
except Exception:
    HAS_C_PARSER = False

# Load Python and JS/TS language parsers
PY_LANGUAGE = tree_sitter.Language(tree_sitter_python.language())
JS_LANGUAGE = tree_sitter.Language(tree_sitter_javascript.language())

def find_nodes(node, types: List[str]):
    """Recursively search for nodes of specific types in the AST."""
    results = []
    if node.type in types:
        results.append(node)
    for child in node.children:
        results.extend(find_nodes(child, types))
    return results

def resolve_python_import(import_name: str, file_path: str, root_path: str) -> Optional[str]:
    """Resolve a Python dotted import path to an absolute file path if it exists locally."""
    file_dir = os.path.dirname(file_path)
    
    # 1. Handle relative imports (leading dots)
    if import_name.startswith('.'):
        # Count leading dots
        dots_count = 0
        for char in import_name:
            if char == '.':
                dots_count += 1
            else:
                break
        
        dotted_part = import_name[dots_count:]
        rel_dir = file_dir
        # Go up directories for extra dots
        for _ in range(dots_count - 1):
            rel_dir = os.path.dirname(rel_dir)
            
        if dotted_part:
            module_path = dotted_part.replace('.', '/')
            candidate = os.path.join(rel_dir, module_path)
        else:
            candidate = rel_dir
    else:
        # 2. Handle absolute/relative imports without dots
        module_path = import_name.replace('.', '/')
        # Candidate A: relative to the root path of the repo
        candidate_a = os.path.join(root_path, module_path)
        # Candidate B: relative to the importing file's directory
        candidate_b = os.path.join(file_dir, module_path)
        
        # We will try candidate B first, then candidate A
        candidates = [candidate_b, candidate_a]
        for cand in candidates:
            # Check for file.py
            if os.path.isfile(cand + '.py'):
                return os.path.abspath(cand + '.py')
            # Check for directory/__init__.py
            init_file = os.path.join(cand, '__init__.py')
            if os.path.isfile(init_file):
                return os.path.abspath(init_file)
        return None

    # For relative imports with dots
    if os.path.isfile(candidate + '.py'):
        return os.path.abspath(candidate + '.py')
    init_file = os.path.join(candidate, '__init__.py')
    if os.path.isfile(init_file):
        return os.path.abspath(init_file)
        
    return None

def resolve_js_import(import_path: str, file_path: str, root_path: str) -> Optional[str]:
    """Resolve JS/TS import or require path to a local absolute path if it exists."""
    # Only resolve local relative imports
    if not (import_path.startswith('./') or import_path.startswith('../')):
        return None
        
    file_dir = os.path.dirname(file_path)
    candidate = os.path.normpath(os.path.join(file_dir, import_path))
    
    # Check candidates with various extensions
    extensions = ['.js', '.ts', '.jsx', '.tsx']
    for ext in extensions:
        if os.path.isfile(candidate + ext):
            return os.path.abspath(candidate + ext)
            
    # Check index files in directory
    if os.path.isdir(candidate):
        for ext in extensions:
            index_file = os.path.join(candidate, f'index{ext}')
            if os.path.isfile(index_file):
                return os.path.abspath(index_file)
                
    # If the file path explicitly includes extension and exists
    if os.path.isfile(candidate):
        return os.path.abspath(candidate)
        
    return None

def resolve_c_include(include_path: str, file_path: str, root_path: str) -> Optional[str]:
    """Resolve C/C++ header include path to an absolute path if it exists locally."""
    file_dir = os.path.dirname(file_path)
    
    # Try relative to the file directory first
    cand_rel = os.path.join(file_dir, include_path)
    if os.path.isfile(cand_rel):
        return os.path.abspath(cand_rel)
        
    # Try relative to root path
    cand_root = os.path.join(root_path, include_path)
    if os.path.isfile(cand_root):
        return os.path.abspath(cand_root)
        
    return None

def parse_c_includes_fallback(content: str) -> List[str]:
    """Fallback parser for C/C++ `#include` statements using regex."""
    includes = []
    # Match lines like `#include "myheader.h"` but skip `#include <stdio.h>`
    pattern = re.compile(r'^\s*#\s*include\s*"([^"]+)"')
    for line in content.splitlines():
        match = pattern.match(line)
        if match:
            includes.append(match.group(1))
    return includes

def extract_dependencies(file_path: str, root_path: str) -> List[str]:
    """Parses local dependencies in a file and returns their absolute paths."""
    if not os.path.exists(file_path):
        return []
        
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception:
        return []
        
    dependencies = []
    
    # ------------------ PYTHON ------------------
    if ext == '.py':
        try:
            parser = tree_sitter.Parser(PY_LANGUAGE)
            tree = parser.parse(bytes(content, 'utf-8'))
            
            # Find import statements (e.g. import a, b.c)
            import_statements = find_nodes(tree.root_node, ['import_statement'])
            for stmt in import_statements:
                dotted_names = find_nodes(stmt, ['dotted_name'])
                for dotted in dotted_names:
                    dotted_text = dotted.text.decode('utf-8', errors='ignore')
                    resolved = resolve_python_import(dotted_text, file_path, root_path)
                    if resolved and resolved not in dependencies:
                        dependencies.append(resolved)
                        
            # Find from...import statements (e.g. from . import x)
            import_from_statements = find_nodes(tree.root_node, ['import_from_statement'])
            for stmt in import_from_statements:
                module_node = None
                imported_names = []
                seen_import_keyword = False
                
                for child in stmt.children:
                    if child.type == 'import':
                        seen_import_keyword = True
                        continue
                    if not seen_import_keyword:
                        if child.type in ['relative_import', 'dotted_name']:
                            module_node = child
                    else:
                        if child.type == 'dotted_name':
                            imported_names.append(child.text.decode('utf-8', errors='ignore'))
                        elif child.type == 'aliased_import':
                            alias_dotted = find_nodes(child, ['dotted_name'])
                            if alias_dotted:
                                imported_names.append(alias_dotted[0].text.decode('utf-8', errors='ignore'))
                
                if module_node:
                    module_text = module_node.text.decode('utf-8', errors='ignore')
                    
                    # 1. Resolve base module text (e.g., submodule.helper)
                    resolved = resolve_python_import(module_text, file_path, root_path)
                    if resolved and resolved not in dependencies:
                        dependencies.append(resolved)
                        
                    # 2. Resolve base module + each imported name (e.g., .another)
                    for imp_name in imported_names:
                        if module_text.endswith('.'):
                            combined = module_text + imp_name
                        else:
                            combined = module_text + '.' + imp_name
                        resolved = resolve_python_import(combined, file_path, root_path)
                        if resolved and resolved not in dependencies:
                            dependencies.append(resolved)
        except Exception:
            return []

    # ------------------ JS / TS ------------------
    elif ext in ['.js', '.ts', '.jsx', '.tsx']:
        try:
            parser = tree_sitter.Parser(JS_LANGUAGE)
            tree = parser.parse(bytes(content, 'utf-8'))
            
            # Find import statements / declarations
            import_declarations = find_nodes(tree.root_node, ['import_statement', 'import_declaration'])
            for decl in import_declarations:
                string_nodes = find_nodes(decl, ['string'])
                for str_node in string_nodes:
                    str_text = str_node.text.decode('utf-8', errors='ignore').strip("'\"`")
                    resolved = resolve_js_import(str_text, file_path, root_path)
                    if resolved and resolved not in dependencies:
                        dependencies.append(resolved)
                        
            # Find require() call expressions
            call_expressions = find_nodes(tree.root_node, ['call_expression'])
            for expr in call_expressions:
                func_node = expr.children[0] if expr.children else None
                if func_node and func_node.type == 'identifier':
                    func_name = func_node.text.decode('utf-8', errors='ignore')
                    if func_name == 'require':
                        string_nodes = find_nodes(expr, ['string'])
                        for str_node in string_nodes:
                            str_text = str_node.text.decode('utf-8', errors='ignore').strip("'\"`")
                            resolved = resolve_js_import(str_text, file_path, root_path)
                            if resolved and resolved not in dependencies:
                                dependencies.append(resolved)
        except Exception:
            return []

    # ------------------ C / C++ ------------------
    elif ext in ['.c', '.cpp', '.h']:
        try:
            if HAS_C_PARSER:
                parser = tree_sitter.Parser(C_LANGUAGE)
                tree = parser.parse(bytes(content, 'utf-8'))
                
                includes = find_nodes(tree.root_node, ['preproc_include'])
                for inc in includes:
                    string_nodes = find_nodes(inc, ['string_literal'])
                    for str_node in string_nodes:
                        str_text = str_node.text.decode('utf-8', errors='ignore').strip('"')
                        resolved = resolve_c_include(str_text, file_path, root_path)
                        if resolved and resolved not in dependencies:
                            dependencies.append(resolved)
            else:
                raw_includes = parse_c_includes_fallback(content)
                for inc in raw_includes:
                    resolved = resolve_c_include(inc, file_path, root_path)
                    if resolved and resolved not in dependencies:
                        dependencies.append(resolved)
        except Exception:
            return []

    return dependencies

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python dependency.py <file_path> <root_path>")
        sys.exit(1)
        
    target_file = sys.argv[1]
    root = sys.argv[2]
    deps = extract_dependencies(target_file, root)
    print(f"File: {target_file}")
    print(f"Dependencies found ({len(deps)}):")
    for d in deps:
        print(f" - {d}")
