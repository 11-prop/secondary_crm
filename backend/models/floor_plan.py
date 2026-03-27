# backend/models/floor_plan.py
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from settings import Base

class FloorPlan(Base):
    __tablename__ = "floor_plans"
    
    plan_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    plan_name = Column(String(100), nullable=False)
    number_of_rooms = Column(Integer)
    square_footage = Column(Numeric)
    amenities = Column(Text)

    # Relationships
    project = relationship("Project", back_populates="floor_plans")
    properties = relationship("Property", back_populates="plan")