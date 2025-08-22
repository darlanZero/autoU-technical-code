import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv("prod.env")


class Settings(BaseSettings):
    appwrite_endpoint: str = os.getenv("appwrite_endpoint")
    appwrite_project: str = os.getenv("appwrite_project") 
    appwrite_key: str = os.getenv("appwrite_key")
    appwrite_database_id: str = os.getenv("appwrite_database_id")
    email_collection_id: str = os.getenv("email_collection_id")

    huggingface_token: str = os.getenv("HUGGINGFACE_TOKEN")
    classification_model: str = os.getenv("CLASSIFICATION_MODEL")
    generation_model: str = os.getenv("GENERATION_MODEL")

    class Config:
        env_file = "prod.env"

settings = Settings()