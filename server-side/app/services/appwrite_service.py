from typing import Any, Dict, List, Optional
from appwrite.id import ID
from appwrite.query import Query

from ..dependencies import get_appwrite_databases
from ..config import settings

class AppwriteService:
    def __init__(self):
        self.database = get_appwrite_databases()
        self.database_id = settings.appwrite_database_id
        
    def create_document(self, collection_id: str, data: Dict[str, Any], document_id: str = None) -> Dict[str, Any]:
        if not document_id:
            document_id = ID.unique()
            
        return self.database.create_document(
            database_id=self.database_id,
            collection_id=collection_id,
            document_id=document_id,
            data=data
        )
    
    def get_document(self, collection_id: str, document_id: str) -> Dict[str, Any]:
        return self.database.get_document(
            database_id=self.database_id,
            collection_id=collection_id,
            document_id=document_id
        )
        
    def list_documents(self, collection_id: str, queries: Optional[list[str]] = None) -> Dict[str, Any]:
        if queries is None:
            queries = []
        return self.database.list_documents(
            database_id=self.database_id,
            collection_id=collection_id,
            queries=queries
        )
        
    def update_document(self, collection_id: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return self.database.update_document(
            database_id=self.database_id,
            collection_id=collection_id,
            document_id=document_id,
            data=data
        )

    def delete_document(self, collection_id: str, document_id: str) -> None:
        return self.database.delete_document(
            database_id=self.database_id,
            collection_id=collection_id,
            document_id=document_id
        )
            
appwrite_service = AppwriteService()