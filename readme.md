# 📧 Email Organizer AutoU

Sistema inteligente de organização de emails com IA integrada, desenvolvido para o processo seletivo da **AutoU**.

## 🎯 Sobre o Projeto

Este é um organizador de emails que utiliza **Inteligência Artificial** para classificar automaticamente emails como **produtivos** ou **improdutivos**, além de sugerir respostas personalizadas. O sistema foi desenvolvido com foco em **produtividade** e **automação**, características essenciais para o ambiente da AutoU.

### ✨ Funcionalidades Principais

- 🤖 **Classificação IA**: Análise automática de emails (produtivo/improdutivo)
- 💬 **Sugestão de Respostas**: IA gera respostas contextualizadas
- 📊 **Dashboard Analítico**: Métricas de produtividade e precisão da IA
- 📧 **Sistema Completo**: Envio, recebimento e organização de emails
- 🔐 **Autenticação Segura**: Sistema de login e registro
- 📱 **Interface Responsiva**: Design moderno e intuitivo
- ⚡ **Tempo Real**: Processamento instantâneo com feedback visual

### 🛠 Tecnologias Utilizadas

**Backend:**
- FastAPI (Python)
- Appwrite (Database & Auth)
- OpenAI/HuggingFace (IA)
- Transformers & Sentence-Transformers

**Frontend:**
- React Router v7
- TypeScript
- Vite
- Tailwind CSS

## 🚀 Instalação Local

### Pré-requisitos
- Python 3.9+
- Node.js 18+
- Conta Appwrite (gratuita)

### 1. Backend Setup

```bash
# Clone o repositório
git clone https://github.com/darlanZero/autoU-technical-code.git
cd autoU-technical-code

# Setup do backend
cd server-side
python -m venv server-side-venv

# Windows
server-side-venv\Scripts\activate

# Linux/Mac
source server-side-venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configuração do Ambiente

```bash
# Copiar arquivo de exemplo
cp prod.env.example prod.env
```

Edite o arquivo `prod.env` com suas credenciais:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT=seu_project_id
APPWRITE_KEY=sua_api_key
APPWRITE_DATABASE_ID=sua_database_id

# Collections IDs
USER_COLLECTION_ID=users
EMAIL_COLLECTION_ID=emails

# AI Configuration (Opcional)
OPENAI_API_KEY=sua_openai_key
HUGGINGFACE_TOKEN=seu_hf_token
```

### 3. Frontend Setup

```bash
# Em outro terminal
cd client-side

# Instalar dependências
npm install

# Configurar variáveis de ambiente
echo "VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1" > .env
```

### 4. Executar o Sistema

```bash
# Terminal 1 - Backend
cd server-side
python run.py

# Terminal 2 - Frontend  
cd client-side
npm run dev
```

### 5. Configurar Appwrite

1. Crie um projeto em [appwrite.io](https://appwrite.io)
2. Crie um database
3. Crie as collections:
   - `users`: name (string), email (string), created_at (datetime)
   - `emails`: subject (string), body (text), sender (string), recipient (string), category (string), etc.

## 📚 API Documentation

Após iniciar o backend:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

**Frontend:**
```env
VITE_API_BASE_URL=https://sua-api-producao.com/api/v1
```

## 🏗 Estrutura do Projeto

```
autoU-technical-code/
├── server-side/           # Backend Python
│   ├── app/
│   │   ├── api/endpoints/ # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── models/        # Modelos de dados
│   │   └── main.py        # App principal
│   ├── requirements.txt
│   ├── run.py
│   └── prod.env.example
├── client-side/           # Frontend React
│   ├── app/
│   │   ├── api/           # Cliente API
│   │   ├── routes/        # Páginas
│   │   └── components/    # Componentes
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🤖 Como a IA Funciona

1. **Análise de Texto**: Utiliza modelos transformer para entender contexto
2. **Classificação**: Determina se email é produtivo/improdutivo
3. **Score de Confiança**: Métrica de precisão da classificação
4. **Geração de Resposta**: Cria resposta contextualizada automática
5. **Aprendizado**: Melhora com base no feedback dos usuários

## 📊 Métricas Disponíveis

- Total de emails processados
- Taxa de emails não lidos
- Distribuição produtivo/improdutivo  
- Precisão da IA
- Tempo de resposta médio

## 🔒 Segurança

- Autenticação baseada em tokens
- Validação de entrada em todas as rotas
- Sanitização de dados
- Rate limiting (recomendado para produção)

## 🛣 Roadmap

- [ ] Integração com Gmail/Outlook
- [ ] Machine Learning personalizado
- [ ] Notificações push
- [ ] Mobile app
- [ ] Relatórios avançados

## 👨‍💻 Desenvolvido para AutoU

Este projeto demonstra:
- **Competência técnica** em Full Stack Development
- **Integração de IA** para automação
- **Foco em produtividade** e experiência do usuário
- **Código limpo** e documentado
- **Deploy-ready** para produção

---

**Desenvolvido com ❤️ para o processo seletivo da AutoU**