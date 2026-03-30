# backend/api/projects.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from configs.settings import get_db
from models.community import Community
from models.project import Project
from schemas.community import CommunityCreate, CommunityResponse, CommunityUpdate
from schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=APIPaginatedResponse[ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(Project).count()
    projects = (
        db.query(Project)
        .options(selectinload(Project.communities))
        .order_by(Project.project_name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Projects retrieved", data=projects, meta=meta)

@router.post("/", response_model=APIResponse[ProjectResponse])
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_project = Project(project_name=project_in.project_name)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return APIResponse(status="success", status_code=201, message="Project created", data=new_project)


@router.patch("/{project_id}", response_model=APIResponse[ProjectResponse])
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).options(selectinload(Project.communities)).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = project_in.dict(exclude_unset=True)
    if "project_name" in updates:
        project_name = (updates["project_name"] or "").strip()
        if not project_name:
            raise HTTPException(status_code=400, detail="Project name is required")
        project.project_name = project_name

    db.commit()
    db.refresh(project)
    return APIResponse(status="success", status_code=200, message="Project updated", data=project)


@router.get("/{project_id}/communities", response_model=APIPaginatedResponse[CommunityResponse])
def get_project_communities(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Community).filter(Community.project_id == project_id)
    total = query.count()
    communities = query.order_by(Community.community_name.asc()).offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total + limit - 1) // limit, current_page=(skip // limit) + 1, limit=limit, has_next=(skip + limit) < total, has_prev=skip > 0)
    return APIPaginatedResponse(status="success", status_code=200, message="Communities retrieved", data=communities, meta=meta)


@router.post("/{project_id}/communities", response_model=APIResponse[CommunityResponse])
def create_project_community(
    project_id: int,
    community_in: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    community_name = community_in.community_name.strip()
    if not community_name:
        raise HTTPException(status_code=400, detail="Community name is required")

    existing = (
        db.query(Community)
        .filter(Community.project_id == project_id, Community.community_name.ilike(community_name))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A community with this name already exists for the selected project")

    community = Community(
        project_id=project_id,
        community_name=community_name,
        layout_plan_path=community_in.layout_plan_path,
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    return APIResponse(status="success", status_code=201, message="Community created", data=community)


@router.patch("/{project_id}/communities/{community_id}", response_model=APIResponse[CommunityResponse])
def update_project_community(
    project_id: int,
    community_id: int,
    community_in: CommunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    community = db.query(Community).filter(Community.community_id == community_id, Community.project_id == project_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    updates = community_in.dict(exclude_unset=True)
    if "community_name" in updates:
        community_name = (updates["community_name"] or "").strip()
        if not community_name:
            raise HTTPException(status_code=400, detail="Community name is required")

        existing = (
            db.query(Community)
            .filter(
                Community.project_id == project_id,
                Community.community_id != community_id,
                Community.community_name.ilike(community_name),
            )
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="A community with this name already exists for the selected project")
        community.community_name = community_name

    if "layout_plan_path" in updates:
        community.layout_plan_path = updates["layout_plan_path"]

    db.commit()
    db.refresh(community)
    return APIResponse(status="success", status_code=200, message="Community updated", data=community)
