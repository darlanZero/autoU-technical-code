from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime
import json

from ...models.email import (
    EmailCreate, EmailUpdate, EmailResponse, EmailSendRequest,
    EmailProcessRequest, EmailProcessResponse, EmailStatus, 
    EmailCategory, EmailInboxResponse
)
from ...services.appwrite_service import appwrite_service
from ...services.email_ai_service import email_ai_service
from ...services.email_user_service import email_user_service
from ...config import settings

router = APIRouter()

@router.post("/emails/send", response_model=EmailResponse, status_code=status.HTTP_201_CREATED)
async def send_email(
    sender_user_id: str,
    email_request: EmailSendRequest
) -> EmailResponse:
    try:
        result = await email_user_service.send_email(
            sender_user_id=sender_user_id,
            recipient_email=email_request.recipient_email,
            subject=email_request.subject,
            body=email_request.body
        )
        return EmailResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.get("/emails/inbox/{user_id}", response_model=EmailInboxResponse)  # ✅ Adicione o @ que está faltando
async def get_user_inbox(
    user_id: str,
    limit: int = 50,
    include_read: bool = True
) -> EmailInboxResponse:
    try:
        result = email_user_service.get_user_inbox(
            user_id=user_id,
            limit=limit,
            include_read=include_read
        )
        emails = [EmailResponse(**email) for email in result['emails']]
        return EmailInboxResponse(
            total=result['total'],
            unread_count=result['unread_count'],
            emails=emails
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/emails/sent/{user_id}", response_model=List[EmailResponse])
async def get_user_sent(user_id: str, limit: int = 50) -> List[EmailResponse]:
    try:
        result = email_user_service.get_user_sent(
            user_id=user_id,
            limit=limit
        )
        return [EmailResponse(**email) for email in result]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.patch("/emails/{email_id}/read")
async def mark_email_as_read(email_id: str, user_id: str):
    try:
        email_user_service.mark_as_read(email_id=email_id, user_id=user_id)  # ✅ Corrigido: era mark_email_as_read
        return {"message": "Email marked as read"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.get("/emails/conversation/{user1_id}/{user2_id}", response_model=List[EmailResponse])
async def get_conversation(user1_id: str, user2_id: str, limit: int = 50) -> List[EmailResponse]:
    try:
        result = email_user_service.get_conversation(
            user1_id=user1_id,
            user2_id=user2_id,
            limit=limit
        )
        return [EmailResponse(**email) for email in result]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

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