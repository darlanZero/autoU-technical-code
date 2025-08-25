# server-side/run.py
import uvicorn
import os

if __name__ == "__main__":
    # ✅ Configuração simples que funciona sempre
    port = int(os.environ.get("PORT", 8080))
    host = "0.0.0.0"  # Necessário para serviços na nuvem
    
    print(f"🚀 Starting FastAPI server on {host}:{port}")
    
    # Configuração otimizada para produção
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,        # Sem reload em produção
        workers=1,           # 1 worker para economizar memória
        log_level="info",
        access_log=False     # Reduz uso de memória
    )