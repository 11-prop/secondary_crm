# backend/api/uploads.py
import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from configs.settings import settings
from schemas.response import APIResponse
from api.deps import get_current_user
from models.user import User

router = APIRouter()

# Define where files should go (matches our Docker volume)
UPLOAD_DIRECTORY = settings.UPLOAD_DIRECTORY

# Ensure directories exist locally
os.makedirs(f"{UPLOAD_DIRECTORY}/projects", exist_ok=True)
os.makedirs(f"{UPLOAD_DIRECTORY}/plans", exist_ok=True)

@router.post("/image", response_model=APIResponse[dict])
def upload_image(
    folder: str = "projects", # can be 'projects' or 'plans'
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads an image file to the physical Docker volume.
    Returns the file path to be saved in the database.
    """
    if folder not in ["projects", "plans"]:
        raise HTTPException(status_code=400, detail="Invalid upload folder specified.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    # Create a unique filename to prevent overwriting
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIRECTORY}/{folder}/{unique_filename}"

    # Write the file physically to the disk
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # Return the relative path so the frontend can request it later
    relative_path = f"/uploads/{folder}/{unique_filename}"
    
    return APIResponse(
        status="success",
        status_code=201,
        message="Image uploaded successfully",
        data={"file_path": relative_path}
    )
