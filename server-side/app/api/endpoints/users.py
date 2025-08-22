from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from typing import List

from ...models.user import User, UserUpdate, UserResponse
from ...services.appwrite_service import appwrite_service
from ...config import settings

router = APIRouter()

@router.post("/users/create_user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: User) -> UserResponse:
    try:
        user_data = user.model_dump()
        now = datetime.utcnow()
        user_data.update({
            "is_active":True,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        })
        
        result = appwrite_service.create_document( 
            collection_id=settings.user_collection_id,
            data=user_data
        )
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str) -> UserResponse:
    try: 
        result = appwrite_service.get_document(
            collection_id=settings.user_collection_id,
            document_id=user_id
        )
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate) -> UserResponse:
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}

    update_data["updated_at"] = datetime.utcnow().isoformat()

    try:
        result = appwrite_service.update_document(
            collection_id=settings.user_collection_id,
            document_id=user_id,
            data=update_data
        )
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str) -> None:
    try:
        appwrite_service.delete_document(
            collection_id=settings.user_collection_id,
            document_id=user_id
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")