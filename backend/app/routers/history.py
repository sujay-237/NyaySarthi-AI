from fastapi import APIRouter
from typing import List
from datetime import datetime

from app.models.schemas import HistoryItem, AnalysisResponse

router = APIRouter()

# In-memory session history (per-process; use a real DB in production)
_history_store: List[HistoryItem] = []


@router.get("/history", response_model=List[HistoryItem])
async def get_history():
    return _history_store


@router.post("/history", response_model=HistoryItem)
async def add_history(item: HistoryItem):
    _history_store.insert(0, item)
    if len(_history_store) > 50:
        _history_store.pop()
    return item


@router.delete("/history")
async def clear_history():
    _history_store.clear()
    return {"message": "History cleared"}


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: str):
    global _history_store
    _history_store = [h for h in _history_store if h.id != item_id]
    return {"message": "Item deleted"}
