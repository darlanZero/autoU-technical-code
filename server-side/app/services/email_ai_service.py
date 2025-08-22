import time
import re
from typing import Tuple, Dict
from openai import OpenAI
from ..config import Settings
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class EmailAIService:
    def __init__(self):
        self._load_models()
    
    def _load_models(self):
        try:
            print("Loading classification model...")
            
            self.classifier = pipeline(
                'text-classification',
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest",
            )
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            self.productive_templates = [
                "preciso de ajuda com um problema urgente",
                "solicito atualização sobre minha requisição",
                "há um erro no sistema que precisa ser corrigido", 
                "preciso de suporte técnico",
                "quando será concluído meu pedido",
                "documento para análise e aprovação",
                "reunião para discussão do projeto"
            ]
            
            self.unproductive_templates = [
                "parabéns pelo excelente trabalho",
                "obrigado pela ajuda de ontem",
                "feliz aniversário para você",
                "bom dia para toda equipe",
                "feliz natal e próspero ano novo"
            ]
            
            self.productive_embeddings = self.embedding_model.encode(self.productive_templates)
            self.unproductive_embeddings = self.embedding_model.encode(self.unproductive_templates)
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Falling back to simple classification method.")
            self.classifier = None
            self.embedding_model = None

    def preprocess_text(self, text: str) -> str:
        text = re.sub(r'[^\w\s\.\!\?\-]', ' ', text)  # Remove special characters except ., !, ?, -
        text = re.sub(r'\s+', ' ', text.strip())  # Replace multiple spaces with a single space
        
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
        text = re.sub(r'\b\d{10,11}\b', '[PHONE]', text)
        return text[:512] if len(text) > 512 else text
    
    def classify_with_huggingface(self, content: str, subject: str = "") -> Tuple[str, float, str]:
        try:
            full_text = f"{subject} {content}".strip()
            
            if self.embedding_model is None:
                return self.classify_email_simple(content, subject)
            
            text_embedding = self.embedding_model.encode([full_text])
            
            productive_similarities = cosine_similarity(text_embedding, self.productive_embeddings)[0]
            max_productive_sim = np.max(productive_similarities)
            
            unproductive_similarities = cosine_similarity(text_embedding, self.unproductive_embeddings)[0]
            max_unproductive_sim = np.max(unproductive_similarities)
            
            # ✅ Debug melhorado
            sentiment_result = self.classifier(full_text[:512])
            sentiment_score = sentiment_result[0]['score'] if sentiment_result else 0.5
            
            print(f"🔍 Debug HF Classification:")
            print(f"   Max Productive Similarity: {max_productive_sim:.3f}")
            print(f"   Max Unproductive Similarity: {max_unproductive_sim:.3f}")
            print(f"   Sentiment Score: {sentiment_score:.3f}")
            print(f"   Sentiment Label: {sentiment_result[0]['label'] if sentiment_result else 'None'}")
            
            if max_productive_sim > max_unproductive_sim:
                category = "produtivo"
                confidence = min(0.95, 0.5 + (max_productive_sim - max_unproductive_sim) + (sentiment_score * 0.2))
                response = self._generate_productive_response_ai(content, subject, max_productive_sim)
            else:
                category = "improdutivo"
                confidence = min(0.95, 0.5 + (max_unproductive_sim - max_productive_sim) + (sentiment_score * 0.2))
                response = self._generate_unproductive_response_ai(content, subject)

            print(f"   Final Category: {category}")
            print(f"   Final Confidence: {confidence:.3f}")
            
            return category, confidence, response
        except Exception as e:
            print(f"❌ Error classifying email: {e}")
            print(f"   Falling back to simple classification...")
            return self.classify_email_simple(content, subject)

    def classify_email_simple(self, content: str, subject: str = "") -> Tuple[str, float, str]:
        content_lower = content.lower()
        subject_lower = subject.lower() if subject else ""
        full_text = f"{subject_lower} {content_lower}"
        
        productive_keywords = [
            'solicitação', 'solicitacao', 'urgent', 'urgente', 'problema', 'erro', 'bug',
            'suporte', 'help', 'ajuda', 'status', 'andamento', 'update', 'atualização',
            'prazo', 'deadline', 'reunião', 'meeting', 'documento', 'arquivo', 'anexo',
            'aprovação', 'aprovar', 'revisar', 'análise', 'pendente', 'pendencia'
        ]
        
        unproductive_keywords = [
            'parabéns', 'parabens', 'feliz', 'aniversário', 'aniversario', 'natal',
            'ano novo', 'obrigado', 'obrigada', 'thanks', 'thank you', 'agradeço',
            'bom dia', 'boa tarde', 'boa noite', 'cumprimentos', 'saudações',
        ]
        
        productive_score = sum(1 for keyword in productive_keywords if keyword in full_text)
        unproductive_score = sum(1 for keyword in unproductive_keywords if keyword in full_text)
        
        if productive_score > unproductive_score:
            category = 'produtivo'
            confidence = min(0.9, 0.6 + (productive_score * 0.1))
            response = self._generate_productive_response(content, subject)
        else:
            category = 'improdutivo'
            confidence = min(0.9, 0.6 + (unproductive_score * 0.1))
            response = self._generate_unproductive_response(content, subject)

        return category, confidence, response
    
    def _generate_productive_response_ai(self, content: str, subject: str, similarity_core: float) -> str:
        content_lower = content.lower()
        
        if similarity_core > 0.8:
            if any(word in content_lower for word in ['status', 'andamento', 'atualização']):
                return "Obrigado por seu contato. Verificamos que você está solicitando uma atualização de status. Nossa equipe está analisando sua solicitação e retornaremos com informações detalhadas em até 24 horas."
            elif any(word in content_lower for word in ['problema', 'erro', 'bug', 'falha']):
                return "Recebemos seu relato sobre o problema técnico. Nosso time especializado já foi notificado e está trabalhando na correção. Manteremos você informado sobre o progresso da solução."
            elif any(word in content_lower for word in ['documento', 'arquivo', 'anexo', 'aprovação']):
                return "Confirmamos o recebimento da documentação. Nossa equipe de análise revisará os materiais enviados e forneceremos feedback dentro do prazo estabelecido."
        
        return "Agradecemos seu contato. Sua mensagem foi classificada como prioritária e será direcionada para a equipe responsável. Retornaremos em breve com uma resposta detalhada."

    def _generate_unproductive_response_ai(self, content: str, subject: str) -> str: 
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['parabéns', 'parabens', 'felicitações']):
            return "Muito obrigado pelas felicitações! Ficamos honrados em receber seu reconhecimento. Continuaremos trabalhando com dedicação."
        elif any(word in content_lower for word in ['obrigado', 'obrigada', 'agradecer']):
            return "Foi um prazer ajudar! Estamos sempre à disposição para apoiá-lo. Conte conosco sempre que precisar."
        elif any(word in content_lower for word in ['feliz', 'natal', 'ano novo', 'aniversário']):
            return "Muito obrigado pelos votos! Desejamos tudo de melhor para você também. Que seja um período repleto de alegrias e conquistas."
        
        return "Agradecemos sua mensagem! É sempre bom receber seu contato. Tenha um excelente dia!"
        
    def _generate_productive_response(self, content: str, subject: str) -> str:
        """Gera resposta para emails produtivos (fallback)"""
        if 'status' in content.lower() or 'andamento' in content.lower():
            return "Obrigado por seu contato. Estamos verificando o status da sua solicitação e retornaremos em breve com uma atualização."
        elif 'problema' in content.lower() or 'erro' in content.lower():
            return "Recebemos seu relato sobre o problema. Nossa equipe técnica está analisando a situação e entraremos em contato com uma solução."
        elif 'documento' in content.lower() or 'arquivo' in content.lower():
            return "Confirmamos o recebimento do seu documento. Nosso time está analisando e responderemos dentro do prazo estabelecido."
        else:
            return "Obrigado por entrar em contato. Sua mensagem foi recebida e será analisada por nossa equipe. Retornaremos em breve."
        
        
    def _generate_unproductive_response(self) -> str:
        """Gera resposta para emails improdutivos (fallback)"""
        return "Agradecemos sua mensagem! Ficamos felizes em receber seu contato."

    async def process_email(self, content: str, subject: str = "") -> Dict:
        start_time = time.time()
        
        # Preprocess the text
        clean_content = self.preprocess_text(content)
        clean_subject = self.preprocess_text(subject) if subject else ""

        if self.classifier and self.embedding_model:
            print("Classifying email with Hugging Face...")
            category, confidence, suggested_response = self.classify_with_huggingface(clean_content, clean_subject)
        else:
            print('Classifying email with simple model...')
            category, confidence, suggested_response = self.classify_email_simple(clean_content, clean_subject)
        processing_time = time.time() - start_time

        return {
            "category": category,
            "confidence_score": round(confidence, 3),
            "suggested_response": suggested_response,
            "processing_time": round(processing_time, 3),
        }
        
email_ai_service = EmailAIService()