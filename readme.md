# Email Organizer AutoU

## Setup Backend

1. Clone o repositório
2. Copie `server-side/prod.env.example` para `server-side/prod.env`
3. Preencha as variáveis de ambiente no `prod.env`:
   - **Appwrite**: Crie um projeto em https://appwrite.io
   - **Hugging Face** (opcional): Token em https://huggingface.co/settings/tokens

## Instalação

```bash
cd server-side
python -m venv server-side-venv
server-side-venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## API Documentation

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc