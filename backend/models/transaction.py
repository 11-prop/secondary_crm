# backend/models/transaction.py
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from configs.settings import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.property_id"))
    transaction_date = Column(Date)
    transaction_type = Column(String(50)) # e.g., Sale, Rent
    price = Column(Numeric)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    property = relationship("Property", back_populates="transactions")
