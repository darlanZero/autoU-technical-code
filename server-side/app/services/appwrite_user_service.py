from typing import Dict, List, Optional
from appwrite.id import ID
from appwrite.enums import password_hash

from ..dependencies import get_appwrite_users
from ..config import settings

class AppwriteUserService:
    def __init__(self):
        self.users = get_appwrite_users()
        
    def create_user(self, email:str, password: str, name: str = None, user_id: str = None) -> Dict:
        if not user_id:
            user_id = ID.unique()
            
        return self.users.create(
            user_id=user_id,
            email=email,
            password=password,
            name=name
        )
    
    def create_sha_user(self, email: str, password: str, name: str = None, user_id: str = None) -> Dict:
        if not user_id:
            user_id = ID.unique()
        
        return self.users.create_sha_user(
            user_id=user_id,
            email=email,
            password=password,
            name=name,
            password_version=password_hash.SHA256
        )
        
    def get_user(self, user_id: str) -> Dict:
        return self.users.get(user_id=user_id)
        
    def list_users(self, queries: Optional[List[str]] = None, search: str = None) -> Dict:
        return self.users.list(queries=queries, search=search)
    
    def update_user(self, user_id: str, name: Optional[str] = None) -> Dict:
        return self.users.update_name(user_id=user_id, name=name) if name else self.users.get(user_id=user_id)
    
    def update_email(self, user_id: str, email: str) -> Dict:
        return self.users.update_email(user_id=user_id, email=email)

    def update_password(self, user_id: str, password: str) -> Dict:
        return self.users.update_password(user_id=user_id, password=password)
    
    def delete_user(self, user_id: str) -> None:
        self.users.delete(user_id=user_id)
        
    def update_user_status(self, user_id: str, is_active: bool) -> Dict:
        return self.users.update_status(user_id=user_id, status=is_active)
    
appwrite_user_service = AppwriteUserService()