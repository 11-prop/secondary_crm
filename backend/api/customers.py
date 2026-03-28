# backend/api/customers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from configs.settings import get_db
from models.customer import Customer
from models.agent import Agent
from models.property import Property
from models.interaction_note import InteractionNote
from schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=APIPaginatedResponse[CustomerResponse])
def get_customers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Protects the route
):
    """Get a paginated list of all customers."""
    total = db.query(Customer).count()
    customers = db.query(Customer).offset(skip).limit(limit).all()
    
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
    
    # --- LEAD PROTECTION ENFORCEMENT ---
    if customer_in.assigned_buyer_agent_id:
        buyer_agent = db.query(Agent).filter(Agent.agent_id == customer_in.assigned_buyer_agent_id).first()
        if not buyer_agent or buyer_agent.agent_type != 'Buyer':
            raise HTTPException(status_code=400, detail="Invalid Buyer Agent selected. Rule Violation.")
            
    if customer_in.assigned_seller_agent_id:
        seller_agent = db.query(Agent).filter(Agent.agent_id == customer_in.assigned_seller_agent_id).first()
        if not seller_agent or seller_agent.agent_type != 'Seller':
            raise HTTPException(status_code=400, detail="Invalid Seller Agent selected. Rule Violation.")
    
    # Create the record
    new_customer = Customer(**customer_in.dict())
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