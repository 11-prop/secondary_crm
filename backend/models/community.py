from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from configs.settings import Base


class Community(Base):
    __tablename__ = "communities"
    __table_args__ = (UniqueConstraint("project_id", "community_name", name="uq_communities_project_name"),)

    community_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    community_name = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=func.now())

    project = relationship("Project", back_populates="communities")
    floor_plans = relationship("FloorPlan", back_populates="community")
    properties = relationship("Property", back_populates="community")
