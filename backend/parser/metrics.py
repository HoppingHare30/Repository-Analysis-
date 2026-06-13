import os
import sys

def calculate_metrics(file_path: str) -> dict:
    """Calculates Lines of Code (LoC) and simple complexity proxy for a file."""
    default_metrics = {"loc": 0, "complexity": 0}
    
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return default_metrics
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError, OSError):
        return default_metrics
    except Exception:
        return default_metrics

    # Calculate LoC
    loc = 0
    lines = content.splitlines()
    for line in lines:
        stripped = line.strip()
        # Skip empty lines
        if not stripped:
            continue
        # Skip comment lines (starting with #, //, /*, *)
        if (stripped.startswith('#') or 
            stripped.startswith('//') or 
            stripped.startswith('/*') or 
            stripped.startswith('*')):
            continue
        loc += 1

    # Calculate complexity proxy
    # Count occurrences of: 'def ', 'class ', 'function ', '=>', '->'
    complexity = 0
    complexity += content.count('def ')
    complexity += content.count('class ')
    complexity += content.count('function ')
    complexity += content.count('=>')
    complexity += content.count('->')

    return {"loc": loc, "complexity": complexity}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python metrics.py <file_path>")
        sys.exit(1)
        
    target_file = sys.argv[1]
    metrics = calculate_metrics(target_file)
    print(f"File: {target_file}")
    print(f"Metrics: {metrics}")
