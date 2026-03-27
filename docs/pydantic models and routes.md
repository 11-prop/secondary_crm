from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, Numeric, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
import os
from pydantic import BaseModel
from typing import List, Optional

# --- DATABASE SETUP ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://crm_user:crm_password@localhost:5432/real_estate_crm")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLALCHEMY MODELS ---
class ProjectModel(Base):
    __tablename__ = "projects"
    project_id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    neighborhood_name = Column(String)

class FloorPlanModel(Base):
    __tablename__ = "floor_plans"
    plan_id = Column(Integer, primary_key=True, index=True)
    plan_name = Column(String)
    number_of_rooms = Column(Integer)
    square_footage = Column(Numeric)

class PropertyModel(Base):
    __tablename__ = "properties"
    property_id = Column(Integer, primary_key=True, index=True)
    villa_number = Column(String)
    owner_customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    plan_id = Column(Integer, ForeignKey("floor_plans.plan_id"))
    is_corner = Column(Boolean)
    is_lake_front = Column(Boolean)
    is_park_front = Column(Boolean)
    is_beach = Column(Boolean)
    is_market = Column(Boolean)
    
    project = relationship("ProjectModel")
    plan = relationship("FloorPlanModel")

class CustomerModel(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)
    email = Column(String)
    client_type = Column(String)
    comments_notes = Column(Text)
    properties = relationship("PropertyModel", backref="owner")

# --- PYDANTIC SCHEMAS ---
class ProjectSchema(BaseModel):
    project_name: str
    neighborhood_name: Optional[str]

class PlanSchema(BaseModel):
    plan_name: str
    number_of_rooms: Optional[int]
    square_footage: Optional[float]

class PropertySchema(BaseModel):
    property_id: int
    villa_number: str
    is_corner: Optional[bool]
    is_lake_front: Optional[bool]
    is_park_front: Optional[bool]
    is_beach: Optional[bool]
    is_market: Optional[bool]
    project: Optional[ProjectSchema]
    plan: Optional[PlanSchema]
    
    class Config:
        from_attributes = True

class CustomerSchema(BaseModel):
    customer_id: int
    first_name: str
    last_name: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    client_type: Optional[str]
    comments_notes: Optional[str]
    properties: List[PropertySchema] = []

    class Config:
        from_attributes = True

# --- FASTAPI APP ---
app = FastAPI(title="Real Estate CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/customers/search", response_model=List[CustomerSchema])
def search_customers(q: str = "", db: Session = Depends(get_db)):
    """Search customers by name, phone, or email"""
    query = db.query(CustomerModel)
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (CustomerModel.first_name.ilike(search_term)) |
            (CustomerModel.last_name.ilike(search_term)) |
            (CustomerModel.phone_number.ilike(search_term)) |
            (CustomerModel.email.ilike(search_term))
        )
    return query.all()

@app.put("/api/customers/{customer_id}")
def update_customer(customer_id: int, tags: dict, db: Session = Depends(get_db)):
    """Update customer tags/notes"""
    customer = db.query(CustomerModel).filter(CustomerModel.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if "client_type" in tags:
        customer.client_type = tags["client_type"]
    if "comments_notes" in tags:
        customer.comments_notes = tags["comments_notes"]
        
    db.commit()
    return {"status": "success"}