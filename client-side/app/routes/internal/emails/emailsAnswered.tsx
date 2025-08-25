import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../api/authContext";
import { emailService, type EmailResponse } from "../../../api/emails";

export default function EmailsAnswered() {
    const { state } = useAuth();
    const [emails, setEmails] = useState<EmailResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (state.user) {
        fetchSentEmails();
        }
    }, [state.user]);

    const fetchSentEmails = async () => {
        if (!state.user) {
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
        const response = await emailService.getSentEmails(state.user.$id);
        setEmails(response);
        } catch (err) {
        setError('Erro ao carregar emails enviados');
        console.error('Erro ao buscar emails enviados:', err);
        } finally {
        setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        );
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📤 Emails Enviados
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
                {emails.length} emails enviados
            </p>
            </div>
            
            <Link
            to="/emails/compose"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
            ✉️ Novo Email
            </Link>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
            </div>
        )}

        {/* Email List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {emails.length === 0 ? (
            <div className="p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 dark:text-gray-400">
                Nenhum email enviado ainda
                </p>
                <Link
                to="/emails/compose"
                className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
                >
                Envie seu primeiro email →
                </Link>
            </div>
            ) : (
            emails.map((email) => (
                <Link
                key={email.$id}
                to={`/emails/${email.$id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                <div className="flex items-start space-x-4">
                    {/* Status icon */}
                    <div className="flex-shrink-0 pt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Enviado"></div>
                    </div>

                    {/* Email content */}
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Para: {email.recipient}
                        </p>
                        <div className="flex items-center space-x-2">
                        {/* Category badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            email.category === 'produtivo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                            {email.category === 'produtivo' ? '✅' : '⚠️'} {email.category}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(email.$createdAt)}
                        </p>
                        </div>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {email.subject}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {email.body.substring(0, 150)}...
                    </p>

                    {/* Status and confidence */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'processed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : email.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {email.status === 'processed' && '✅ Processado'}
                            {email.status === 'pending' && '⏳ Pendente'}
                            {email.status === 'failed' && '❌ Falhou'}
                        </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confiança:
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(email.confidence_score * 100)}%
                        </span>
                        </div>
                    </div>
                    </div>
                </div>
                </Link>
            ))
            )}
        </div>
        </div>
    );
}