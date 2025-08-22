from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.query import Query
from .config import settings

def get_appwrite_client():
    client = Client()
    client.set_endpoint(settings.appwrite_endpoint).set_project(settings.appwrite_project).set_key(settings.appwrite_key)
    return client

def get_appwrite_databases():
    client = get_appwrite_client()
    return Databases(client)
