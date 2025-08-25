import os
import subprocess
import sys

if __name__ == "__main__":
    port = os.environ.get("PORT", "8000")
    
    if os.environ.get("RENDER"):
        cmd = [
            "gunicorn",
            "app.main:app",
            "--worker-class", "uvicorn.workers.UvicornWorker",
            "--bind", f"0.0.0.0:{port}"
            "--workers", "1",
            "--timeout", "120"
        ]
        print(f"Starting server with Gunicorn on port {port}")
        subprocess.run(cmd)
    else:
        import uvicorn
        uvicorn.run("app.main:app", host="127.0.0.1", port=int(port), reload=True)
