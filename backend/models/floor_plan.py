# backend/models/floor_plan.py
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from configs.settings import Base

class FloorPlan(Base):
    __tablename__ = "floor_plans"
    
    plan_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    community_id = Column(Integer, ForeignKey("communities.community_id", ondelete="SET NULL"), nullable=True)
    plan_name = Column(String(100), nullable=False)
    number_of_rooms = Column(Integer)
    square_footage = Column(Numeric)
    amenities = Column(Text)
    floor_plan_image_path = Column(Text)

    # Relationships
    project = relationship("Project", back_populates="floor_plans")
    community = relationship("Community", back_populates="floor_plans")
    properties = relationship("Property", back_populates="plan")
    transactions = relationship("Transaction", back_populates="plan")
