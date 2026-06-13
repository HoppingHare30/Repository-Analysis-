import os
import sys
from typing import List

def is_binary(file_path: str) -> bool:
    """Check if a file is binary by scanning the first 1024 bytes for a null byte."""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            return b'\x00' in chunk
    except Exception:
        # If we cannot read the file, treat it as binary/inaccessible
        return True

def traverse_repo(root_path: str) -> List[str]:
    """Recursively traverses the directory and returns absolute file paths of supported files."""
    if not root_path or not os.path.exists(root_path) or not os.path.isdir(root_path):
        return []

    supported_extensions = {'.py', '.js', '.ts', '.jsx', '.tsx', '.c', '.cpp', '.h'}
    skip_dirs = {'node_modules', '.git', '__pycache__', 'dist', 'build', '.venv', 'venv', '.next', 'out', '.cache'}
    
    file_list = []
    
    try:
        # Convert root_path to absolute path
        abs_root = os.path.abspath(root_path)
        
        for dirpath, dirnames, filenames in os.walk(abs_root):
            # Modify dirnames in-place to prevent os.walk from recursing into skipped directories
            dirnames[:] = [d for d in dirnames if d not in skip_dirs]
            
            for filename in filenames:
                _, ext = os.path.splitext(filename)
                if ext.lower() not in supported_extensions:
                    continue
                
                # Skip .pyc files explicitly
                if filename.endswith('.pyc'):
                    continue
                    
                file_path = os.path.join(dirpath, filename)
                
                try:
                    # Check file size (500KB = 500 * 1024 bytes)
                    file_size = os.path.getsize(file_path)
                    if file_size > 500 * 1024:
                        continue
                        
                    # Skip binary files
                    if is_binary(file_path):
                        continue
                        
                    file_list.append(file_path)
                except Exception:
                    # Skip files that cause permission or read errors
                    continue
    except Exception:
        # Fail gracefully by returning whatever we found or an empty list
        pass
        
    return file_list

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python traverser.py <directory_path>")
        sys.exit(1)
        
    target_path = sys.argv[1]
    files = traverse_repo(target_path)
    print(f"Traversed: {target_path}")
    print(f"Found {len(files)} files:")
    for f in files:
        print(f" - {f}")
