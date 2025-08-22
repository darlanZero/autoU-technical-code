from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime
import json

from ...models.email import (
    EmailCreate, EmailUpdate, EmailResponse, EmailProcessRequest, 
    EmailProcessResponse, EmailStatus, EmailCategory
)
from ...services.appwrite_service import appwrite_service
from ...services.email_ai_service import email_ai_service
from ...config import settings

router = APIRouter()

@router.post("/emails/process-text", response_model=EmailProcessResponse)
async def process_email_text(request: EmailProcessRequest) -> EmailProcessResponse:
    try:
        result = await email_ai_service.process_email(
            content=request.text_content,
            subject=request.subject or ""
        )
        return EmailProcessResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/emails", response_model=EmailResponse, status_code=status.HTTP_201_CREATED)
async def create_and_process_email(email: EmailCreate) -> EmailResponse:
    try:
        # Processa com IA
        ai_result = await email_ai_service.process_email(
            content=email.body,
            subject=email.subject
        )
        
        email_data = email.model_dump()
        now = datetime.utcnow()
        email_data.update({
            "category": ai_result["category"],
            "confidence_score": ai_result["confidence_score"],
            "suggested_response": ai_result["suggested_response"],
            "status": EmailStatus.PROCESSED,
            "processed_at": now.isoformat(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        })
        
        result = appwrite_service.create_document(
            collection_id=settings.email_collection_id,
            data=email_data
        )
        
        return EmailResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/emails", response_model=List[EmailResponse])
async def list_emails(
    category: Optional[EmailCategory] = None,
    status: Optional[EmailStatus] = None,
    limit: int = 50
) -> List[EmailResponse]:
    try:
        queries = []
        if category:
            queries.append(f'equal("category", "{category.value}")')
        if status:
            queries.append(f'equal("status", "{status.value}")')
        
        result = appwrite_service.list_documents(
            collection_id=settings.email_collection_id,
            queries=queries
        )
        
        return [EmailResponse(**email) for email in result['documents']]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/emails/{email_id}", response_model=EmailResponse)
async def get_email(email_id: str) -> EmailResponse:
    try:
        result = appwrite_service.get_document(
            collection_id=settings.email_collection_id,
            document_id=email_id
        )
        return EmailResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

@router.put("/emails/{email_id}", response_model=EmailResponse)
async def update_email(email_id: str, email_update: EmailUpdate) -> EmailResponse:
    try:
        update_data = {k: v for k, v in email_update.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = appwrite_service.update_document(
            collection_id=settings.email_collection_id,
            document_id=email_id,
            data=update_data
        )
        return EmailResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

@router.delete("/emails/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email(email_id: str) -> None:
    try:
        appwrite_service.delete_document(
            collection_id=settings.email_collection_id,
            document_id=email_id
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

@router.post("/emails/{email_id}/reprocess", response_model=EmailResponse)
async def reprocess_email(email_id: str) -> EmailResponse:
    try:
        email = appwrite_service.get_document(
            collection_id=settings.email_collection_id,
            document_id=email_id
        )
        
        ai_result = await email_ai_service.process_email(
            content=email['body'],
            subject=email['subject']
        )
        
        update_data = {
            "category": ai_result["category"],
            "confidence_score": ai_result["confidence_score"],
            "suggested_response": ai_result["suggested_response"],
            "status": EmailStatus.PROCESSED,
            "processed_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = appwrite_service.update_document(
            collection_id=settings.email_collection_id,
            document_id=email_id,
            data=update_data
        )
        
        return EmailResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")