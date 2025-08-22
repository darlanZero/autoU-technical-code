from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str = Field(..., description="The email address of the user")
    password: str = Field(..., min_length=8, description="User password")
    name: Optional[str] = Field(None, description="The name of the user")

class UserCreateSHA(BaseModel):
    email: str = Field(..., description="The email address of the user")
    password: str = Field(..., description="SHA password")
    name: Optional[str] = Field(None, description="The name of the user")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, description="The name of the user")
    email: Optional[str] = Field(None, description="The email address of the user")
    
class UserResponse(BaseModel):
    id: str = Field(alias="$id", description="User ID")
    name: str = Field(..., description="User name")
    email: str = Field(..., description="User email")
    status: bool = Field(..., description="User status")
    registration: datetime = Field(..., description="Registration date")
    emailVerification: bool = Field(..., description="Email verification status")
    phoneVerification: bool = Field(..., description="Phone verification status")

    class Config:
        populate_by_name = True