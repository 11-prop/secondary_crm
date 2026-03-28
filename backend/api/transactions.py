# backend/api/transactions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from configs.settings import get_db
from models.transaction import Transaction
from schemas.transaction import TransactionCreate, TransactionResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/property/{property_id}", response_model=APIPaginatedResponse[TransactionResponse])
def get_property_transactions(property_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Transaction).filter(Transaction.property_id == property_id).order_by(Transaction.transaction_date.desc())
    total = query.count()
    transactions = query.offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Transactions retrieved", data=transactions, meta=meta)

@router.post("/", response_model=APIResponse[TransactionResponse])
def create_transaction(transaction_in: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_transaction = Transaction(**transaction_in.dict())
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return APIResponse(status="success", status_code=201, message="Transaction recorded", data=new_transaction)