# backend/api/customers.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List

from configs.settings import get_db
from core.customer_identity import clean_customer_payload, enforce_customer_identity_uniqueness
from models.customer import Customer
from models.agent import Agent
from models.property import Property
from models.interaction_note import InteractionNote
from schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()


def validate_agent_assignments(db: Session, buyer_agent_id: int | None, seller_agent_id: int | None):
    if buyer_agent_id:
        buyer_agent = db.query(Agent).filter(Agent.agent_id == buyer_agent_id).first()
        if not buyer_agent or buyer_agent.agent_type != "Buyer":
            raise HTTPException(status_code=400, detail="Invalid Buyer Agent selected. Rule Violation.")

    if seller_agent_id:
        seller_agent = db.query(Agent).filter(Agent.agent_id == seller_agent_id).first()
        if not seller_agent or seller_agent.agent_type != "Seller":
            raise HTTPException(status_code=400, detail="Invalid Seller Agent selected. Rule Violation.")

@router.get("/", response_model=APIPaginatedResponse[CustomerResponse])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    q: str | None = Query(default=None),
    client_type: str | None = Query(default=None),
    protected_only: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Protects the route
):
    """Get a paginated list of all customers."""
    query = db.query(Customer)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            (Customer.first_name.ilike(term))
            | (Customer.last_name.ilike(term))
            | (Customer.email.ilike(term))
            | (Customer.phone_number.ilike(term))
        )
    if client_type:
        query = query.filter(Customer.client_type.ilike(client_type.strip()))
    if protected_only is True:
        query = query.filter(
            or_(
                Customer.assigned_buyer_agent_id.isnot(None),
                Customer.assigned_seller_agent_id.isnot(None),
            )
        )

    total = query.count()
    customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0
    )
    
    return APIPaginatedResponse(
        status="success",
        status_code=200,
        message="Customers retrieved successfully",
        data=customers,
        meta=meta
    )

@router.post("/", response_model=APIResponse[CustomerResponse])
def create_customer(
    customer_in: CustomerCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new customer and enforce Lead Protection Rules."""

    validate_agent_assignments(
        db,
        customer_in.assigned_buyer_agent_id,
        customer_in.assigned_seller_agent_id,
    )

    payload = clean_customer_payload(customer_in.dict())
    enforce_customer_identity_uniqueness(
        db,
        email=payload.get("email"),
        phone_number=payload.get("phone_number"),
    )

    # Create the record
    new_customer = Customer(**payload)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    
    return APIResponse(
        status="success",
        status_code=201,
        message="Customer created successfully",
        data=new_customer
    )

@router.get("/{customer_id}", response_model=APIResponse[CustomerResponse])
def get_customer_360(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Customer 360 View: Fetch a specific customer. 
    (In a real frontend, you might also fetch properties/notes in parallel or include them in a specialized 360 schema).
    """
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    return APIResponse(
        status="success",
        status_code=200,
        message="Customer profile retrieved",
        data=customer
    )


@router.patch("/{customer_id}", response_model=APIResponse[CustomerResponse])
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    updates = clean_customer_payload(customer_in.dict(exclude_unset=True))

    validate_agent_assignments(
        db,
        updates.get("assigned_buyer_agent_id", customer.assigned_buyer_agent_id),
        updates.get("assigned_seller_agent_id", customer.assigned_seller_agent_id),
    )

    enforce_customer_identity_uniqueness(
        db,
        email=updates.get("email", customer.email),
        phone_number=updates.get("phone_number", customer.phone_number),
        exclude_customer_id=customer.customer_id,
    )

    for field, value in updates.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return APIResponse(
        status="success",
        status_code=200,
        message="Customer updated successfully",
        data=customer,
    )
