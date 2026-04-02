# backend/models/project.py
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from configs.settings import Base

class Project(Base):
    __tablename__ = "projects"
    
    project_id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(150), nullable=False)
    neighborhood_name = Column(String(150))
    layout_plan_path = Column(Text)

    # Relationships
    communities = relationship("Community", back_populates="project", cascade="all, delete-orphan")
    floor_plans = relationship("FloorPlan", back_populates="project")
    properties = relationship("Property", back_populates="project")
    transactions = relationship("Transaction", back_populates="project")
