# backend/api/interaction_notes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from configs.settings import get_db
from models.interaction_note import InteractionNote
from schemas.interaction_note import InteractionNoteCreate, InteractionNoteResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/customer/{customer_id}", response_model=APIPaginatedResponse[InteractionNoteResponse])
def get_customer_notes(customer_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get the chronological ledger for a specific customer."""
    query = db.query(InteractionNote).filter(InteractionNote.customer_id == customer_id).order_by(InteractionNote.created_at.desc())
    total = query.count()
    notes = query.offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Notes retrieved", data=notes, meta=meta)

@router.post("/", response_model=APIResponse[InteractionNoteResponse])
def create_interaction_note(note_in: InteractionNoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_note = InteractionNote(**note_in.dict())
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return APIResponse(status="success", status_code=201, message="Note appended", data=new_note)