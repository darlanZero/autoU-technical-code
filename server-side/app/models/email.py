from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class EmailCategory(str, Enum):
    UNPRODUCTIVE = "produtivo"
    PRODUCTIVE = "improdutivo"

class EmailStatus(str, Enum):
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"
    
class EmailCreate(BaseModel):
    subject: str = Field(..., description="The subject of the email")
    body: str = Field(..., description="The body content of the email")
    sender: Optional[str] = Field(..., description="The sender's email address")
    recipient: Optional[str] = Field(..., description="The recipient's email address")

class EmailUpdate(BaseModel):
    subject: Optional[str] = Field(None, description="The subject of the email")
    body: Optional[str] = Field(None, description="The body content of the email")
    category: Optional[EmailCategory] = Field(None, description="The category of the email")
    suggested_response: Optional[str] = Field(None, description="AI suggested response to the email")
    
class EmailResponse(BaseModel):
    id: str = Field(..., description="The unique identifier of the email")
    subject: str = Field(..., description="The subject of the email")
    body: str = Field(..., description="The body content of the email")
    sender: Optional[str] = Field(..., description="The sender's email address")
    recipient: Optional[str] = Field(..., description="The recipient's email address")
    category: Optional[EmailCategory] = Field(None, description="The category of the email")
    confidence_score: Optional[float] = Field(..., description="The confidence score of the email classification(0-1)")
    suggested_response: Optional[str] = Field(None, description="AI suggested response to the email")
    status: EmailStatus = Field(..., description="The processing status of the email")
    processed_at: Optional[datetime] = Field(..., description="Timestamp when the email was processed by the AI")
    created_at: datetime = Field(..., description="Timestamp when the email was created")
    updated_at: datetime = Field(..., description="Timestamp when the email was last updated")
    
    class Config:
        populate_by_name = True
        validate_by_name = True

class EmailProcessRequest(BaseModel):
    text_content: str = Field(..., description="raw content of the email")
    subject: Optional[str] = Field(..., description="The subject of the email(optional)")
    
class EmailProcessResponse(BaseModel):
    category: EmailCategory = Field(..., description="The category of the email")
    confidence_score: float = Field(..., description="The confidence score of the email classification(0-1)")
    suggested_response: str = Field(..., description="AI suggested response to the email")
    processing_time: float = Field(..., description="Time taken to process the email (in seconds)")