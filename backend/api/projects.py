# backend/api/projects.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from configs.settings import get_db
from models.project import Project
from schemas.project import ProjectCreate, ProjectResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=APIPaginatedResponse[ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Project).count()
    projects = db.query(Project).offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Projects retrieved", data=projects, meta=meta)

@router.post("/", response_model=APIResponse[ProjectResponse])
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_project = Project(**project_in.dict())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return APIResponse(status="success", status_code=201, message="Project created", data=new_project)