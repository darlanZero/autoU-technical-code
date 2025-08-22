from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    email_adress: str = Field(..., description="The email address of the user")
    name: str = Field(..., description="The name of the user")
   
    
class UserUpdate(BaseModel):
    email_adress: Optional[str] = Field(None, description="The email address of the user")
    name: Optional[str] = Field(None, description="The name of the user")
    is_active: Optional[bool] = Field(None, description="Indicates if the user account is active")
    
class UserResponse(BaseModel):
    email_adress: str
    name: str
    created_at: datetime 
    updated_at: datetime 
    is_active: bool 

    class Config:
        populate_by_name = True
        from_attributes = True