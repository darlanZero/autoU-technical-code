import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../api/authContext";
import { emailService, type EmailResponse } from "../../../api/emails";

export default function EmailsHome() {
    const { state } = useAuth();
    const navigate = useNavigate();
    const [emails, setEmails] = useState<EmailResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'produtivo' | 'improdutivo'>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (state.user) {
        fetchEmails();
        }
    }, [state.user, filter]);

    const fetchEmails = async () => {
        if (!state.user) return;
        
        setIsLoading(true);
        setError('');
        
        try {
        const response = await emailService.getInbox(state.user.$id);
        setEmails(response.emails);
        setUnreadCount(response.unread_count);
        } catch (err) {
        setError('Erro ao carregar emails');
        console.error('Erro ao buscar emails:', err);
        } finally {
        setIsLoading(false);
        }
    };

    const handleEmailClick = async (email: EmailResponse) => {
        if (!email.is_read && state.user) {
        try {
            await emailService.markAsRead(email.$id, state.user.$id);
            setEmails(prev => prev.map(e => 
            e.$id === email.$id ? { ...e, is_read: true } : e
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erro ao marcar como lido:', error);
        }
        }
        
        navigate(`/emails/${email.$id}`);
    };

    const filteredEmails = emails.filter(email => {
        switch (filter) {
        case 'unread':
            return !email.is_read;
        case 'produtivo':
            return email.category === 'produtivo';
        case 'improdutivo':
            return email.category === 'improdutivo';
        default:
            return true;
        }
    });

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
                📧 Caixa de Entrada
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount} emails não lidos de {emails.length} total
            </p>
            </div>
            
            <Link
            to="/emails/compose"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
            ✉️ Novo Email
            </Link>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            {[
            { key: 'all', label: 'Todos', count: emails.length },
            { key: 'unread', label: 'Não Lidos', count: unreadCount },
            { key: 'produtivo', label: 'Produtivos', count: emails.filter(e => e.category === 'produtivo').length },
            { key: 'improdutivo', label: 'Improdutivos', count: emails.filter(e => e.category === 'improdutivo').length },
            ].map(({ key, label, count }) => (
            <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
                {label} ({count})
            </button>
            ))}
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
            </div>
        )}

        {/* Email List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmails.length === 0 ? (
            <div className="p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 dark:text-gray-400">
                Nenhum email encontrado para este filtro
                </p>
            </div>
            ) : (
            filteredEmails.map((email) => (
                <div
                key={email.$id}
                onClick={() => handleEmailClick(email)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !email.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                >
                <div className="flex items-start space-x-4">
                    {/* Status indicator */}
                    <div className="flex-shrink-0 pt-1">
                    {!email.is_read ? (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    ) : (
                        <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                    </div>

                    {/* Email content */}
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                        !email.is_read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                        De: {email.sender}
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
                    
                    <h3 className={`text-sm mt-1 ${
                        !email.is_read 
                        ? 'font-semibold text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                        {email.subject}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {email.body.substring(0, 150)}...
                    </p>

                    {/* Confidence score */}
                    <div className="flex items-center mt-2">
                        <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confiança IA:
                        </span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
                </div>
            ))
            )}
        </div>
        </div>
    );
}