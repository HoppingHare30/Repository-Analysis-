import os
from typing import Tuple
from dotenv import load_dotenv
import google.generativeai as genai

# Import caching functions using absolute import from backend namespace
from backend.ai.cache import compute_file_hash, get_cached_summary, set_cached_summary

# Load environment variables from .env
load_dotenv()

# Configure Google Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_summary(file_path: str) -> Tuple[str, bool]:
    """Generates a 3-sentence summary for a file, leveraging the cache first."""
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return "Summary unavailable.", False
        
    try:
        # 1. Compute hash and check cache
        file_hash = compute_file_hash(file_path)
        cached_summary = get_cached_summary(file_path, file_hash)
        if cached_summary:
            return cached_summary, True
            
        # 2. Cache miss: read file content
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Truncate content to 8000 characters if larger
        if len(content) > 8000:
            content = content[:8000]
            
        filename = os.path.basename(file_path)
        prompt = (
            "You are a code documentation assistant. Explain what this file does in exactly 3 simple sentences. "
            "Be specific about its purpose, what it imports or exports, and any key logic. Do not use jargon.\n\n"
            f"File: {filename}\n"
            f"Contents:\n"
            f"{content}"
        )
        
        # 3. Call Gemini API
        # Return fallback if API key is not configured
        if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "your_key_here":
            return "Summary unavailable.", False
            
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        summary = response.text.strip()
        if not summary:
            return "Summary unavailable.", False
            
        # 4. Store in cache and return
        set_cached_summary(file_path, file_hash, summary)
        return summary, False
        
    except Exception:
        # Fall back to "Summary unavailable." on any error
        return "Summary unavailable.", False
