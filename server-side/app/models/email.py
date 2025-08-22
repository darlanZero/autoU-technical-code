import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Email(BaseModel):
    id: str = Field(..., description="The unique identifier for the email")
    user_id: str = Field(..., description="The unique identifier for the user")
    subject: str = Field(..., description="The subject of the email")
    body: str = Field(..., description="The body of the email")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the email was created")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the email was last updated")

class EmailUpdate(BaseModel):
    subject: Optional[str] = Field(None, description="The subject of the email")
    body: Optional[str] = Field(None, description="The body of the email")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
