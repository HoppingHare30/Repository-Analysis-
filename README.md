# Repo Explorer 🔍

Repo Explorer is an interactive web-based repository visualization and analysis tool. It allows developers to ingest a local Git repository, parse its file dependencies, visualize the file-to-file connection structure as an interactive network canvas, and inspect metrics, logic complexity, and AI-generated summaries for individual files.

---

## 🌟 Key Features

* **Interactive Dependency Graph**: Visualize directories and files as a clean, styled React Flow network.
  * Nodes represent files (color-coded by programming language) and directories.
  * Edges represent file import/include dependencies.
  * Support for dragging nodes, zooming, and panning.
* **Granular File Inspector**: Clicking any file node opens a sliding SidePanel containing:
  * **Metrics**: Non-empty, non-comment Lines of Code (LoC).
  * **Logic Complexity**: Simple code complexity indicators (e.g., control structures like loops, conditionals, logical operators).
  * **AI-Generated Summary**: 3-sentence summary describing the file's purpose, exports, and core logic powered by **Gemini 2.5 Flash** (with local caching).
* **Smart Repository Traverser**: Automatically traverses the project structure while omitting large files, package manager dependencies, build directories, and caches.
* **Multi-Language AST Parsing**:
  * **Python**: Abstract Syntax Tree (AST) parsing of imports.
  * **JavaScript**: AST parsing of ES Module imports.
  * **C/C++**: Regex-based preprocessor include parser capable of resolving header/source relationships (e.g., standard layout, or matching headers nested inside `/include` folder).

---

## 🛠️ Tech Stack

* **Backend**: 
  * [FastAPI](https://fastapi.tiangolo.com/) (Python web framework)
  * [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) (Robust syntax tree parsing for Python/JS/C)
  * Google Generative AI (Gemini 2.5 Flash API)
  * `python-dotenv` for config management
* **Frontend**:
  * [React](https://react.dev/) + [Vite](https://vite.dev/)
  * [React Flow v11](https://reactflow.dev/) (Interactive node canvas)
  * [Tailwind CSS](https://tailwindcss.com/) (Premium UI styling)
  * Axios (HTTP Client)

---

## 🚀 Getting Started

### Prerequisites
* Python **3.9+** (Fully backward-compatible with 3.9.6+)
* Node.js **18+** (NPM v9+)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install python packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a copy of `.env.example` named `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   The API will run locally at `http://localhost:8000`. You can inspect API documentation at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
   By default, the React application runs at `http://localhost:5173` (or the port specified by Vite in the terminal output). Open this URL in your web browser.

---

## 📋 Assumptions & Scope

### 1. Ignored Directories & Files
To preserve memory, processing efficiency, and avoid visual clutter, the traverser ignores the following folders:
* Git structures: `.git`
* Package managers: `node_modules`, `bower_components`
* Python environments: `venv`, `.venv`, `env`
* Cache & Build directories: `.next`, `.cache`, `out`, `dist`, `build`

### 2. Import & Dependency Resolution
* **Python**: Supports `import x` and `from y import z` statements. It resolves these within the provided repository root path.
* **JavaScript**: Parses ES6 `import` statements. It matches relative paths (e.g. `./components/Canvas` or `../utils/api`). It does not resolve third-party package dependencies (e.g. `react`, `axios`).
* **C/C++**: Scans `#include "filename.h"` local headers. If a matching file isn't present in the source folder, it searches in the `include/` directory relative to the project root.

### 3. File Metrics & Complexity
* **Lines of Code (LoC)**: Calculates non-empty, non-comment lines of code based on language comments (`#` for Python, `//` and `/* ... */` for JS/C/C++).
* **Complexity**: Uses proxy indicators to measure conditional logic and flow. It counts loops (`for`, `while`), conditionals (`if`, `else`, `switch`, `case`), and logical operators (`&&`, `||`, `and`, `or`).

### 4. AI Summary Cache
* AI summaries are cached locally inside `backend/cache.json` indexed by an MD5 hash of the file contents. If a file is modified, its hash changes, invalidating the cache and querying the Gemini API for a new summary.
* If `GEMINI_API_KEY` is not present or invalid, the inspector displays a graceful fallback: `"Summary unavailable."`.
