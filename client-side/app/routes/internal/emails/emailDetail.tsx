import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../../../api/authContext";
import { emailService, type EmailResponse } from "../../../api/emails";

export default function EmailDetail() {
    const { emailId } = useParams<{ emailId: string }>();
    const { state } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState<EmailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSuggestedResponse, setShowSuggestedResponse] = useState(false);

    useEffect(() => {
        if (emailId) {
        fetchEmail();
        }
    }, [emailId]);

    const fetchEmail = async () => {
        if (!emailId) {
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
        const response = await emailService.getEmail(emailId);
        setEmail(response);
        
        if (!response.is_read && state.user && response.recipient_user_id === state.user.$id) {
            await emailService.markAsRead(emailId, state.user.$id);
            setEmail(prev => prev ? { ...prev, is_read: true } : null);
        }
        } catch (err) {
        setError('Erro ao carregar email');
        console.error('Erro ao buscar email:', err);
        } finally {
        setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    const handleReply = () => {
        if (email) {
        navigate('/emails/compose', {
            state: {
            replyTo: email,
            recipient: email.sender,
            subject: `Re: ${email.subject}`
            }
        });
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
        await navigator.clipboard.writeText(text);
        // Poderia adicionar um toast aqui
        console.log('Texto copiado!');
        } catch (err) {
        console.error('Erro ao copiar texto:', err);
        }
    };

    if (isLoading) {
        return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        );
    }

    if (error || !email) {
        return (
        <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-gray-500 dark:text-gray-400">
            {error || 'Email não encontrado'}
            </p>
            <Link 
            to="/emails" 
            className="text-blue-600 hover:text-blue-500 mt-4 inline-block"
            >
            ← Voltar para inbox
            </Link>
        </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <Link 
            to="/emails" 
            className="text-blue-600 hover:text-blue-500 flex items-center"
            >
            ← Voltar para inbox
            </Link>
            
            <div className="flex space-x-2">
            <button
                onClick={handleReply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
                ↩️ Responder
            </button>
            </div>
        </div>

        {/* Email Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            {/* Email header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {email.subject}
                </h1>
                
                <div className="space-y-2">
                    <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-16">
                        De:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                        {email.sender}
                    </span>
                    </div>
                    
                    <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-16">
                        Para:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                        {email.recipient}
                    </span>
                    </div>
                    
                    <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-16">
                        Data:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(email.$createdAt)}
                    </span>
                    </div>
                </div>
                </div>

                {/* Category badge */}
                <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    email.category === 'produtivo'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                    {email.category === 'produtivo' ? '✅ Produtivo' : '⚠️ Improdutivo'}
                </span>
                
                {/* Confidence score */}
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                    Confiança:
                    </span>
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${email.confidence_score * 100}%` }}
                    ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(email.confidence_score * 100)}%
                    </span>
                </div>
                </div>
            </div>
            </div>

            {/* Email body */}
            <div className="px-6 py-8">
            <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {email.body}
                </div>
            </div>
            </div>

            {/* Suggested Response */}
            {email.suggested_response && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    🤖 Resposta Sugerida pela IA
                </h3>
                <button
                    onClick={() => setShowSuggestedResponse(!showSuggestedResponse)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                    {showSuggestedResponse ? 'Ocultar' : 'Mostrar'}
                </button>
                </div>
                
                {showSuggestedResponse && (
                <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-md border">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {email.suggested_response}
                    </p>
                    </div>
                    
                    <div className="flex space-x-2">
                    <button
                        onClick={() => copyToClipboard(email.suggested_response)}
                        className="text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 px-3 py-1 rounded transition-colors"
                    >
                        📋 Copiar
                    </button>
                    
                    <button
                        onClick={() => navigate('/emails/compose', {
                        state: {
                            replyTo: email,
                            recipient: email.sender,
                            subject: `Re: ${email.subject}`,
                            prefillBody: email.suggested_response
                        }
                        })}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    >
                        ✏️ Usar como base
                    </button>
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    );
}