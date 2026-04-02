# backend/api/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from api.deps import get_current_user
from configs.settings import get_db
from models.community import Community
from models.floor_plan import FloorPlan
from models.project import Project
from models.property import Property
from models.transaction import Transaction
from models.user import User
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from schemas.transaction import TransactionCreate, TransactionResponse

router = APIRouter()


def build_transaction_order(query):
    return query.order_by(
        Transaction.transaction_recorded_at.desc().nullslast(),
        Transaction.transaction_date.desc().nullslast(),
        Transaction.created_at.desc(),
        Transaction.transaction_id.desc(),
    )


def resolve_transaction_context(
    db: Session,
    property_id: int | None,
    project_id: int | None,
    community_id: int | None,
    plan_id: int | None,
):
    property_record = None
    if property_id is not None:
        property_record = db.query(Property).filter(Property.property_id == property_id).first()
        if not property_record:
            raise HTTPException(status_code=404, detail="Property not found")

        if project_id is None:
            project_id = property_record.project_id
        elif property_record.project_id is not None and property_record.project_id != project_id:
            raise HTTPException(status_code=400, detail="Selected transaction project does not match the property")

        if community_id is None:
            community_id = property_record.community_id
        elif property_record.community_id is not None and property_record.community_id != community_id:
            raise HTTPException(status_code=400, detail="Selected transaction community does not match the property")

        if plan_id is None:
            plan_id = property_record.plan_id
        elif property_record.plan_id is not None and property_record.plan_id != plan_id:
            raise HTTPException(status_code=400, detail="Selected transaction floor plan does not match the property")

    plan = None
    if plan_id is not None:
        plan = db.query(FloorPlan).filter(FloorPlan.plan_id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Floor plan not found")

        if project_id is None:
            project_id = plan.project_id
        elif plan.project_id is not None and plan.project_id != project_id:
            raise HTTPException(status_code=400, detail="Selected floor plan does not belong to the selected project")

        if plan.community_id is not None:
            if community_id is None:
                community_id = plan.community_id
            elif plan.community_id != community_id:
                raise HTTPException(status_code=400, detail="Selected floor plan does not belong to the selected community")

    community = None
    if community_id is not None:
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")

        if project_id is None:
            project_id = community.project_id
        elif community.project_id != project_id:
            raise HTTPException(status_code=400, detail="Selected community does not belong to the selected project")

    if project_id is not None:
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    if property_id is None and community_id is None and project_id is None:
        raise HTTPException(status_code=400, detail="A property, community, or project is required for a transaction")

    return {
        "property_id": property_id,
        "project_id": project_id,
        "community_id": community_id,
        "plan_id": plan_id,
        "property_record": property_record,
    }


@router.get("/", response_model=APIPaginatedResponse[TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    project_id: int | None = None,
    community_id: int | None = None,
    plan_id: int | None = None,
    property_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction)
    if project_id is not None:
        query = query.filter(Transaction.project_id == project_id)
    if community_id is not None:
        query = query.filter(Transaction.community_id == community_id)
    if plan_id is not None:
        query = query.filter(Transaction.plan_id == plan_id)
    if property_id is not None:
        query = query.filter(Transaction.property_id == property_id)

    total = query.count()
    transactions = build_transaction_order(query).offset(skip).limit(limit).all()
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0,
    )
    return APIPaginatedResponse(status="success", status_code=200, message="Transactions retrieved", data=transactions, meta=meta)


@router.get("/community/{community_id}", response_model=APIPaginatedResponse[TransactionResponse])
def get_community_transactions(
    community_id: int,
    skip: int = 0,
    limit: int = 100,
    plan_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    community = db.query(Community).filter(Community.community_id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    query = db.query(Transaction).filter(Transaction.community_id == community_id)
    if plan_id is not None:
        query = query.filter(or_(Transaction.plan_id.is_(None), Transaction.plan_id == plan_id))

    total = query.count()
    transactions = build_transaction_order(query).offset(skip).limit(limit).all()
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0,
    )
    return APIPaginatedResponse(status="success", status_code=200, message="Community transactions retrieved", data=transactions, meta=meta)


@router.get("/property/{property_id}", response_model=APIPaginatedResponse[TransactionResponse])
def get_property_transactions(
    property_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_record = db.query(Property).filter(Property.property_id == property_id).first()
    if not property_record:
        raise HTTPException(status_code=404, detail="Property not found")

    filters = [Transaction.property_id == property_id]

    if property_record.community_id is not None:
        if property_record.plan_id is not None:
            filters.append(
                and_(
                    Transaction.community_id == property_record.community_id,
                    Transaction.property_id.is_(None),
                    or_(Transaction.plan_id.is_(None), Transaction.plan_id == property_record.plan_id),
                )
            )
        else:
            filters.append(
                and_(
                    Transaction.community_id == property_record.community_id,
                    Transaction.property_id.is_(None),
                )
            )
    elif property_record.project_id is not None:
        filters.append(
            and_(
                Transaction.project_id == property_record.project_id,
                Transaction.community_id.is_(None),
                Transaction.property_id.is_(None),
            )
        )

    query = db.query(Transaction).filter(or_(*filters))
    total = query.count()
    transactions = build_transaction_order(query).offset(skip).limit(limit).all()
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0,
    )
    return APIPaginatedResponse(status="success", status_code=200, message="Transactions retrieved", data=transactions, meta=meta)


@router.post("/", response_model=APIResponse[TransactionResponse])
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = transaction_in.dict()
    resolved_context = resolve_transaction_context(
        db,
        payload.get("property_id"),
        payload.get("project_id"),
        payload.get("community_id"),
        payload.get("plan_id"),
    )
    payload.update({
        "property_id": resolved_context["property_id"],
        "project_id": resolved_context["project_id"],
        "community_id": resolved_context["community_id"],
        "plan_id": resolved_context["plan_id"],
    })

    new_transaction = Transaction(**payload)
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return APIResponse(status="success", status_code=201, message="Transaction recorded", data=new_transaction)
