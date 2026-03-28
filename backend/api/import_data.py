# backend/api/import_data.py
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from io import BytesIO

from configs.settings import get_db
from models.customer import Customer
from models.property import Property
from schemas.response import APIResponse
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.post("/excel", response_model=APIResponse[dict])
def bulk_import_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Parses an uploaded Excel file and populates Customers and Properties.
    Expected columns: first_name, last_name, email, phone_number, villa_number
    """
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only Excel or CSV files are supported.")

    try:
        # Read the file directly from memory into Pandas
        contents = file.file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))
            
        # Standardize column names (lowercase, strip spaces)
        df.columns = df.columns.str.strip().str.lower()
        
        customers_added = 0
        properties_added = 0

        # Iterate through the rows
        for index, row in df.iterrows():
            email = str(row.get('email', '')).strip()
            if not email or email == 'nan':
                continue # Skip rows without emails for safety
                
            # 1. Create or find Customer
            customer = db.query(Customer).filter(Customer.email == email).first()
            if not customer:
                customer = Customer(
                    first_name=str(row.get('first_name', 'Unknown')),
                    last_name=str(row.get('last_name', '')),
                    email=email,
                    phone_number=str(row.get('phone_number', ''))
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
                customers_added += 1

            # 2. Create or find Property and link to Customer
            villa_number = str(row.get('villa_number', '')).strip()
            if villa_number and villa_number != 'nan':
                prop = db.query(Property).filter(Property.villa_number == villa_number).first()
                if not prop:
                    new_property = Property(
                        villa_number=villa_number,
                        owner_customer_id=customer.customer_id
                    )
                    db.add(new_property)
                    db.commit()
                    properties_added += 1

        return APIResponse(
            status="success",
            status_code=200,
            message="Bulk import completed successfully",
            data={
                "customers_added": customers_added,
                "properties_added": properties_added
            }
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")