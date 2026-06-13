import os
import hashlib
import json
from typing import Optional
from datetime import datetime

# cache.py is located in backend/ai/cache.py
# The cache file should be placed at backend/cache.json
AI_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(AI_DIR)
CACHE_FILE = os.path.join(BACKEND_DIR, "cache.json")

def compute_file_hash(file_path: str) -> str:
    """Computes the MD5 hash of the file contents."""
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return ""
    try:
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return ""

def _read_cache() -> dict:
    """Helper to read the cache file safely."""
    if not os.path.exists(CACHE_FILE):
        return {}
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def get_cached_summary(file_path: str, current_hash: str) -> Optional[str]:
    """Retrieves the cached summary if the file exists in the cache and the hash matches."""
    if not current_hash:
        return None
    cache = _read_cache()
    # Normalize path to ensure consistency
    norm_path = os.path.abspath(file_path)
    
    # Check absolute path key first
    entry = cache.get(norm_path)
    if not entry:
        # Fallback to key check as relative or raw input path
        entry = cache.get(file_path)
        
    if entry and entry.get("hash") == current_hash:
        return entry.get("summary")
    return None

def set_cached_summary(file_path: str, file_hash: str, summary: str) -> None:
    """Sets a cached summary and persists it to backend/cache.json immediately."""
    if not file_hash:
        return
    cache = _read_cache()
    norm_path = os.path.abspath(file_path)
    
    cache[norm_path] = {
        "hash": file_hash,
        "summary": summary,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass
