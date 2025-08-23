from typing import Dict, List, Optional
from datetime import datetime
from appwrite.exception import AppwriteException

from ..services.appwrite_service import appwrite_service
from ..services.appwrite_user_service import appwrite_user_service
from ..services.email_ai_service import email_ai_service
from ..config import settings

class EmailUserService:
    def __init__(self):
        pass
    
    async def send_email(self, sender_user_id: str, recipient_email: str, subject: str, body: str) -> Dict:
        try:
            print(f"📧 Iniciando envio de email:")
            print(f"   Sender ID: {sender_user_id}")
            print(f"   Recipient Email: {recipient_email}")
            
            # 1. Buscar usuário destinatário pelo email EXATO
            recipient_users = appwrite_user_service.list_users(search=recipient_email)
            print(f"   Resultado da busca: {len(recipient_users.get('users', []))} usuários encontrados")

            if not recipient_users.get('users') or len(recipient_users['users']) == 0:
                raise ValueError(f"Recipient email {recipient_email} not found.")

            # 🔧 CORREÇÃO: Encontrar usuário com email EXATO
            recipient_user = None
            for user in recipient_users['users']:
                if user['email'] == recipient_email:
                    recipient_user = user
                    break
            
            if not recipient_user:
                raise ValueError(f"Recipient email {recipient_email} not found (exact match).")
                
            recipient_user_id = recipient_user['$id']
            print(f"   Recipient encontrado - ID: {recipient_user_id}, Email: {recipient_user['email']}")

            # 2. Verificar se remetente existe
            try:
                sender_user = appwrite_user_service.get_user(sender_user_id)
                sender_email = sender_user.get('email', '')
                print(f"   Sender encontrado - Email: {sender_email}")
            except Exception as e:
                print(f"   ❌ Erro ao buscar sender: {e}")
                raise ValueError(f"Sender user {sender_user_id} not found.")

            # 3. Verificar se sender e recipient são diferentes
            if sender_user_id == recipient_user_id:
                raise ValueError("❌ ERRO: Não é possível enviar email para si mesmo!")

            # 4. Processar email com IA
            print("🤖 Processing email with AI...")
            ai_result = await email_ai_service.process_email(content=body, subject=subject)

            # 5. Preparar dados do email
            now = datetime.utcnow()
            email_data = {
                "subject": subject,
                "body": body,
                'sender': sender_email,
                "sender_user_id": sender_user_id,
                "recipient": recipient_email,
                "recipient_user_id": recipient_user_id,
                "category": ai_result['category'],
                "confidence_score": ai_result['confidence_score'],
                "suggested_response": ai_result['suggested_response'],
                "status": "processed",
                "is_read": False,
                "processed_at": now.isoformat(),
                "created_at": now.isoformat(),
                "updated_at": now.isoformat()
            }
            
            print(f"📋 Dados preparados para salvar:")
            print(f"   sender: {email_data['sender']}")
            print(f"   sender_user_id: {email_data['sender_user_id']}")
            print(f"   recipient: {email_data['recipient']}")
            print(f"   recipient_user_id: {email_data['recipient_user_id']}")
            print(f"   subject: {email_data['subject']}")

            # 6. Salvar no banco
            result = appwrite_service.create_document(
                collection_id=settings.email_collection_id,
                data=email_data
            )

            print(f"✅ Email enviado com sucesso!")
            print(f"   De: {sender_email} ({sender_user_id})")
            print(f"   Para: {recipient_email} ({recipient_user_id})")
            print(f"   Classificação: {ai_result['category']} ({ai_result['confidence_score']:.2f} confiança)")

            return result
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            raise Exception(f"Error sending email: {str(e)}")
    
    def get_user_inbox(self, user_id: str, limit: int = 50, include_read: bool = True) -> Dict:
        try:
            queries = [f'equal("recipient_user_id", "{user_id}")']
            if not include_read:
                queries.append('equal("is_read", false)')
            queries.append(f'limit({limit})')
            queries.append('orderDesc("created_at")')
            
            result = appwrite_service.list_documents(
                collection_id=settings.email_collection_id,
                queries=queries
            )
            
            emails = result['documents']
            total = len(emails)
            unread_count = len([email for email in emails if not email.get('is_read', False)])
            
            return {
                "total": total,
                "unread_count": unread_count,
                "emails": emails
            }
            
        except Exception as e:
            raise Exception(f"Error retrieving inbox for user {user_id}: {e}")
        
    def get_user_sent(self, user_id: str, limit: int = 50) -> List[Dict]:
        try:
            queries = [
                f'equal("sender_user_id", "{user_id}")',
                f'limit({limit})',
                'orderDesc("created_at")'
            ]
            
            result = appwrite_service.list_documents(
                collection_id=settings.email_collection_id,
                queries=queries
            )
            
            return result['documents']
        except Exception as e:
            raise Exception(f"Error retrieving sent emails for user {user_id}: {e}")
        
    def mark_as_read(self, email_id: str, user_id: str) -> Dict:
        try:
            email = appwrite_service.get_document(
                collection_id=settings.email_collection_id,
                document_id=email_id
            )

            if email.get('recipient_user_id') != user_id:
                raise PermissionError("User does not have permission to mark this email as read.")

            result = appwrite_service.update_document(
                collection_id=settings.email_collection_id,
                document_id=email_id,
                data={
                    "is_read": True,
                    "updated_at": datetime.utcnow().isoformat()
                }
            )
            
            return result
        except Exception as e:
            raise Exception(f"Error marking email {email_id} as read for user {user_id}: {e}")
        
    def get_conversation(self, user1_id: str, user2_id: str, limit: int = 50) -> List[Dict]:
        try:
            queries1 = [
                f'equal("sender_user_id", "{user1_id}")',
                f'equal("recipient_user_id", "{user2_id}")',
            ]
            
            queries2 = [
                f'equal("sender_user_id", "{user2_id}")',
                f'equal("recipient_user_id", "{user1_id}")',
            ]
            
            result1 = appwrite_service.list_documents(
                collection_id=settings.email_collection_id,
                queries=queries1
            )

            result2 = appwrite_service.list_documents(
                collection_id=settings.email_collection_id,
                queries=queries2
            )

            all_emails = result1['documents'] + result2['documents']
            all_emails.sort(key=lambda x: x['created_at'])
            
            
            return all_emails[:limit]
        except Exception as e:
            raise Exception(f"Error retrieving conversation between {user1_id} and {user2_id}: {e}")

email_user_service = EmailUserService()
