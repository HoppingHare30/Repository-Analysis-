# Repo Explorer

Repo Explorer is a tool that ingests a local Git repository, parses its dependency graph, visualizes it as an interactive canvas, and explains individual files using AI.

## Getting Started

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Set up a Python virtual environment (Optional but recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Copy the example environment file and add your Gemini API Key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and replace `your_key_here` with your actual Google Gemini API key.

5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   The backend server will start at `http://127.0.0.1:8000`. You can access the API documentation at `http://127.0.0.1:8000/docs`.
