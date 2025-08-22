import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv("prod.env")


class Settings(BaseSettings):
    appwrite_endpoint: str = os.getenv("appwrite_endpoint")
    appwrite_project: str = os.getenv("appwrite_project") 
    appwrite_key: str = os.getenv("appwrite_key")
    appwrite_database_id: str = os.getenv("appwrite_database_id")
    user_collection_id: str = os.getenv("user_collection_id")
    email_collection_id: str = os.getenv("email_collection_id")

    class Config:
        env_file = "prod.env"

settings = Settings()