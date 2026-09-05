from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.workspace import (
    SavedWorkspaceItem,
    SavedWorkspaceCreate,
    WorkspaceListResponse
)
from app.services.workspace_service import workspace_service

router = APIRouter()

@router.get("/", response_model=WorkspaceListResponse)
def list_workspaces(
    category: Optional[str] = Query(None, description="Filter by category: comparison, accuracy, anomaly, statistical, custom"),
    search: Optional[str] = Query(None, description="Search keyword in title, description or tags")
):
    """List all saved scientific analysis workspaces and preset templates."""
    items = workspace_service.get_all_workspaces(category=category, search=search)
    return WorkspaceListResponse(total=len(items), workspaces=items)

@router.post("/", response_model=SavedWorkspaceItem)
def create_workspace(payload: SavedWorkspaceCreate):
    """Save a new customized analysis session or comparison state."""
    return workspace_service.create_workspace(payload)

@router.get("/{ws_id}", response_model=SavedWorkspaceItem)
def get_workspace_detail(ws_id: str):
    """Get full state and configuration of a saved workspace."""
    ws = workspace_service.get_workspace_by_id(ws_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found.")
    return ws

@router.post("/{ws_id}/clone", response_model=SavedWorkspaceItem)
def clone_workspace(ws_id: str):
    """Clone an existing workspace into an editable custom workspace."""
    cloned = workspace_service.clone_workspace(ws_id)
    if not cloned:
        raise HTTPException(status_code=404, detail="Source workspace not found.")
    return cloned

@router.delete("/{ws_id}")
def delete_workspace(ws_id: str):
    """Delete a saved workspace by ID."""
    success = workspace_service.delete_workspace(ws_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found.")
    return {"status": "SUCCESS", "message": f"Workspace {ws_id} deleted."}
