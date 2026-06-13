import os
import sys

# Add the backend and project root directories to sys.path to resolve imports cleanly
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Import using backend namespace to avoid conflicts with standard library 'parser'
from backend.parser.traverser import traverse_repo
from backend.parser.dependency import extract_dependencies
from backend.parser.metrics import calculate_metrics
from backend.models.graph import GraphResponse, Node, Edge, Metrics, Position

app = FastAPI(title="Repo Explorer API")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/graph", response_model=GraphResponse)
async def get_graph(path: str = Query(..., description="Absolute path to local repository")):
    # Validate that the repository path exists and is a directory
    if not os.path.exists(path) or not os.path.isdir(path):
        raise HTTPException(status_code=400, detail="Repository path not found")
        
    abs_root = os.path.abspath(path)
    file_paths = traverse_repo(abs_root)
    
    # 1. Build nodes list
    nodes = []
    node_set = set()
    for index, file_path in enumerate(file_paths):
        rel_path = os.path.relpath(file_path, abs_root)
        label = os.path.basename(file_path)
        
        # Calculate file metrics
        file_metrics = calculate_metrics(file_path)
        metrics_obj = Metrics(
            loc=file_metrics["loc"],
            complexity=file_metrics["complexity"]
        )
        
        # Node positioning - Simple Grid Fallback Layout
        x = (index % 10) * 250.0
        y = (index // 10) * 150.0
        position_obj = Position(x=x, y=y)
        
        node_obj = Node(
            id=rel_path,
            label=label,
            metrics=metrics_obj,
            position=position_obj
        )
        nodes.append(node_obj)
        node_set.add(rel_path)
        
    # 2. Build edges list
    edges = []
    for file_path in file_paths:
        rel_path = os.path.relpath(file_path, abs_root)
        
        # Parse local dependencies
        deps = extract_dependencies(file_path, abs_root)
        for dep in deps:
            rel_dep = os.path.relpath(dep, abs_root)
            
            # Only add the edge if both source and target nodes exist in the graph
            if rel_dep in node_set:
                edge_id = f"{rel_path}->{rel_dep}"
                edge_obj = Edge(
                    id=edge_id,
                    source=rel_path,
                    target=rel_dep
                )
                edges.append(edge_obj)
                
    return GraphResponse(nodes=nodes, edges=edges)

@app.get("/api/summary")
async def get_summary():
    return {"status": "ok"}

@app.get("/api/metrics")
async def get_metrics():
    return {"status": "ok"}
