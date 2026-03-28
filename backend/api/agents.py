# backend/api/agents.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from configs.settings import get_db
from models.agent import Agent
from schemas.agent import AgentCreate, AgentResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=APIPaginatedResponse[AgentResponse])
def get_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Agent).count()
    agents = db.query(Agent).offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Agents retrieved", data=agents, meta=meta)

@router.post("/", response_model=APIResponse[AgentResponse])
def create_agent(agent_in: AgentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if agent_in.agent_type not in ['Buyer', 'Seller']:
        raise HTTPException(status_code=400, detail="Agent type must be 'Buyer' or 'Seller'")
    new_agent = Agent(**agent_in.dict())
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return APIResponse(status="success", status_code=201, message="Agent created", data=new_agent)