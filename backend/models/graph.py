from typing import List
from pydantic import BaseModel

class Metrics(BaseModel):
    loc: int
    complexity: int

class Position(BaseModel):
    x: float
    y: float

class Node(BaseModel):
    id: str           # relative file path
    label: str        # filename only
    metrics: Metrics
    position: Position

class Edge(BaseModel):
    id: str
    source: str       # file that imports
    target: str       # file being imported

class GraphResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
