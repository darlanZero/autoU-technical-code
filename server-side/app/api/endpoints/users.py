from fastapi import APIRouter, HTTPException, status
from typing import List

from ...models.user import UserCreate, UserCreateSHA, UserUpdate, UserResponse
from ...services.appwrite_user_service import appwrite_user_service

router = APIRouter()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> UserResponse:
    """Cria um novo usuário usando o Users service"""
    try:
        result = appwrite_user_service.create_user(
            email=user.email,
            password=user.password,
            name=user.name
        )
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/users/sha", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_sha_user(user: UserCreateSHA) -> UserResponse:
    try:
        result = appwrite_user_service.create_sha_user(
            email=user.email,
            password=user.password,
            name=user.name
        )
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str) -> UserResponse:
    try:
        result = appwrite_user_service.get_user(user_id)
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.get("/users", response_model=List[UserResponse])
async def list_users(search: str = None) -> List[UserResponse]:
    try:
        result = appwrite_user_service.list_users(search=search)
        return [UserResponse(**user) for user in result['users']]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate) -> UserResponse:
    try:
        if user_update.email:
            appwrite_user_service.update_email(user_id, user_update.email)
        if user_update.name:
            appwrite_user_service.update_user(user_id, name=user_update.name)
        
        result = appwrite_user_service.get_user(user_id)
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def toggle_user_status(user_id: str, status: bool) -> UserResponse:
    try:
        result = appwrite_user_service.update_status(user_id, status)
        return UserResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str) -> None:
    try:
        appwrite_user_service.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")