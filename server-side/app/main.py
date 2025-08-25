from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import users, emails

from .config import settings

app = FastAPI(
    title="Email Handling API", 
    version="1.0.0",
    description="API for handling email-related operations using Appwrite.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",   
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
            "http://localhost:3000",           # React dev
            "http://localhost:5173",           # Vite dev  
            "https://vercel.app",              # Vercel preview
            "https://*.vercel.app", 
            "https://auto-u-technical-code.vercel.app",
            "https://auto-u-technical-code-git-main.vercel.app",
            "*"
        ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(emails.router, prefix="/api/v1", tags=["emails"])

@app.get("/routes", tags=["admin"])
async def get_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name,
                'summary': route.summary or "No summary provided"
            })
    return {"routes": routes}

@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to the Email Handling API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }
    
# ✅ Debug middleware para ver requisições
@app.middleware("http")
async def debug_cors(request: Request, call_next):
    print(f"🔍 Request: {request.method} {request.url}")
    print(f"🔍 Origin: {request.headers.get('origin', 'No origin')}")
    print(f"🔍 Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    print(f"✅ Response: {response.status_code}")
    print(f"✅ CORS Headers: {response.headers.get('access-control-allow-origin', 'None')}")
    
    return response

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
