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
    sender_user_id: str = Field(..., description="The sender's user ID")
    recipient_user_id: str = Field(..., description="The recipient's user ID")

class EmailUpdate(BaseModel):
    subject: Optional[str] = Field(None, description="The subject of the email")
    body: Optional[str] = Field(None, description="The body content of the email")
    category: Optional[EmailCategory] = Field(None, description="The category of the email")
    suggested_response: Optional[str] = Field(None, description="AI suggested response to the email")
    is_read: Optional[bool] = Field(None, description="Whether the email has been read")
    
class EmailResponse(BaseModel):
    id: str = Field(alias="$id", description="The unique identifier of the email")
    subject: str = Field(..., description="The subject of the email")
    body: str = Field(..., description="The body content of the email")

    sender: Optional[str] = Field(..., description="The sender's email address")
    recipient: Optional[str] = Field(..., description="The recipient's email address")
    sender_user_id: str = Field(..., description="The sender's user ID")
    recipient_user_id: str = Field(..., description="The recipient's user ID")
    
    category: Optional[EmailCategory] = Field(None, description="The category of the email")
    confidence_score: Optional[float] = Field(..., description="The confidence score of the email classification(0-1)")
    suggested_response: Optional[str] = Field(None, description="AI suggested response to the email")

    status: EmailStatus = Field(default=EmailStatus.PENDING, description="The processing status of the email")
    is_read: bool = Field(default=False, description="Whether the email has been read")
    processed_at: Optional[datetime] = Field(None, description="Timestamp when the email was processed by the AI")
    created_at: datetime = Field(..., description="Timestamp when the email was created")
    updated_at: datetime = Field(..., description="Timestamp when the email was last updated")
    
    class Config:
        populate_by_name = True
        validate_by_name = True
        
class EmailSendRequest(BaseModel):
    recipient_email: str = Field(..., description="The recipient's email address")
    subject: str = Field(..., description="The subject of the email")
    body: str = Field(..., description="The body content of the email")

class EmailProcessRequest(BaseModel):
    text_content: str = Field(..., description="raw content of the email")
    subject: Optional[str] = Field(..., description="The subject of the email(optional)")
    
class EmailProcessResponse(BaseModel):
    category: EmailCategory = Field(..., description="The category of the email")
    confidence_score: float = Field(..., description="The confidence score of the email classification(0-1)")
    suggested_response: str = Field(..., description="AI suggested response to the email")
    processing_time: float = Field(..., description="Time taken to process the email (in seconds)")
    
class EmailInboxResponse(BaseModel):
    total: int = Field(..., description="Total number of emails in the inbox")
    unread_count: int = Field(..., description="Total number of unread emails in the inbox")
    emails: List[EmailResponse] = Field(..., description="List of emails in the inbox")