# backend/api/uploads.py
import os
import mimetypes
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

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
ALLOWED_ASSET_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
ALLOWED_ASSET_CONTENT_TYPES = {"application/pdf"}


def resolve_upload_file(file_path: str) -> Path:
    base_directory = Path(UPLOAD_DIRECTORY).resolve()
    requested_path = Path(file_path.lstrip("/"))
    resolved_path = (base_directory / requested_path).resolve()

    try:
        resolved_path.relative_to(base_directory)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Asset not found.") from exc

    if not resolved_path.is_file():
        raise HTTPException(status_code=404, detail="Asset not found.")

    return resolved_path

@router.post("/image", response_model=APIResponse[dict])
def upload_image(
    folder: str = "projects", # can be 'projects' or 'plans'
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image or PDF asset to the physical Docker volume.
    Returns the file path to be saved in the database.
    """
    if folder not in ["projects", "plans"]:
        raise HTTPException(status_code=400, detail="Invalid upload folder specified.")

    file_extension = Path(file.filename or "").suffix.lower()
    content_type = (file.content_type or "").lower()
    is_supported_image = content_type.startswith("image/") or file_extension in ALLOWED_ASSET_EXTENSIONS - {".pdf"}
    is_supported_pdf = content_type in ALLOWED_ASSET_CONTENT_TYPES or file_extension == ".pdf"
    if not (is_supported_image or is_supported_pdf):
        raise HTTPException(status_code=400, detail="Only image files and PDFs are supported.")

    # Create a unique filename to prevent overwriting
    unique_filename = f"{uuid4()}{file_extension}"
    file_path = f"{UPLOAD_DIRECTORY}/{folder}/{unique_filename}"
    bytes_written = 0

    # Write the file physically to disk while enforcing a safe upload limit.
    try:
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > settings.MAX_ASSET_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File is too large. The maximum supported size is {settings.MAX_ASSET_UPLOAD_MB} MB.",
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    finally:
        file.file.close()

    # Return the relative path so the frontend can request it later
    relative_path = f"/uploads/{folder}/{unique_filename}"
    
    return APIResponse(
        status="success",
        status_code=201,
        message="Asset uploaded successfully",
        data={"file_path": relative_path}
    )


@router.get("/file/{file_path:path}")
def get_uploaded_file(
    file_path: str,
    current_user: User = Depends(get_current_user),
):
    """
    Serve uploaded files through the API namespace so deployments that only
    proxy `/api/` still render uploaded assets correctly.
    """
    resolved_path = resolve_upload_file(file_path)
    media_type, _ = mimetypes.guess_type(str(resolved_path))
    return FileResponse(
        path=resolved_path,
        filename=resolved_path.name,
        media_type=media_type or "application/octet-stream",
        content_disposition_type="inline",
    )
