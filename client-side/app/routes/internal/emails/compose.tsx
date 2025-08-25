import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/api/authContext";
import {emailService, type EmailResponse } from "~/api/emails";

interface ComposeState {
    replyTo?: EmailResponse;
    recipient?: string;
    subject?: string;
    prefillBody?: string;
}

export default function EmailCompose() {
    const { state: routeState} = useLocation();
    const { state: authState } = useAuth();
    const navigate = useNavigate();

    const composeState = routeState as ComposeState || null;

    const [formData, setFormData] = useState({
        recipient: composeState?.recipient || "",
        subject: composeState?.subject || "",
        body: composeState?.prefillBody || "",
    })

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isReply = !!composeState?.replyTo;

    useEffect(() => {
        if (composeState?.replyTo) {
            setFormData({
                recipient: composeState.replyTo.sender,
                subject: composeState.subject || `Re: ${composeState.replyTo.subject}`,
                body: composeState.prefillBody || `\n\n--- Original Message ---\nFrom: ${composeState.replyTo.sender}\nContent: ${composeState.replyTo.subject}\nData: ${new Date(composeState.replyTo.$createdAt).toLocaleString('pt-BR')}\n\n${composeState.replyTo.body}`,
            });
        }
    }, [composeState]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!authState.user) {
            setError('User not autenticated');
            return;
        }

        if (!formData.recipient.trim() || !formData.subject.trim() || !formData.body.trim()) {
            setError('Please fill in all fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.recipient.trim())) {
            setError('Invalid recipient email');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await emailService.sendEmail(authState.user.$id, {
                recipient_email: formData.recipient,
                subject: formData.subject,
                body: formData.body,
            })

            setSuccess(isReply ? 'Reply sent successfully!' : 'Email sent successfully!');

            setTimeout(() => {
                navigate('/emails', { replace: true });
            }, 2000)
        } catch (error) {
            console.error('Error sending email:', error);
            setError(error instanceof Error ? error.message : 'Error sending email');
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancel = () => {
        if (composeState?.replyTo) {
            navigate(`/emails/${composeState.replyTo.$id}`);
        } else {
            navigate('/emails');
        }
    }

    return(
        <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isReply ? '↩️ Responder Email' : '✉️ Novo Email'}
            </h1>
            {isReply && composeState?.replyTo && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                Respondendo para: {composeState.replyTo.sender}
                </p>
            )}
            </div>

            <div className="flex space-x-2">
            <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
                Cancelar
            </button>
            </div>
        </div>

        {/* Success Message */}
        {success && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-md">
            <div className="flex items-center">
                <span className="mr-2">✅</span>
                {success}
            </div>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            <div className="flex items-center">
                <span className="mr-2">❌</span>
                {error}
            </div>
            </div>
        )}

        {/* Reply Context */}
        {isReply && composeState?.replyTo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                📧 Respondendo ao email
                </h3>
                <Link
                to={`/emails/${composeState.replyTo.$id}`}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                Ver email original →
                </Link>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>De:</strong> {composeState.replyTo.sender}</p>
                <p><strong>Assunto:</strong> {composeState.replyTo.subject}</p>
                <p><strong>Data:</strong> {new Date(composeState.replyTo.$createdAt).toLocaleDateString('pt-BR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
            </div>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 space-y-6">
            {/* Recipient */}
            <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para: <span className="text-red-500">*</span>
                </label>
                <input
                type="email"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                disabled={isReply} // Desabilita se é resposta
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    isReply ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                }`}
                placeholder="destinatario@exemplo.com"
                />
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assunto: <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Assunto do email"
                />
            </div>

            {/* Body */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem: <span className="text-red-500">*</span>
                </label>
                <textarea
                id="body"
                name="body"
                rows={12}
                value={formData.body}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
                placeholder="Digite sua mensagem aqui..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.body.length} caracteres
                </p>
            </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                {isReply ? '📧 Este email será enviado como resposta' : '📧 Este email será processado pela IA'}
                </div>
                
                <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Cancelar
                </button>
                
                <button
                    type="submit"
                    disabled={isLoading || !formData.recipient.trim() || !formData.subject.trim() || !formData.body.trim()}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    isLoading || !formData.recipient.trim() || !formData.subject.trim() || !formData.body.trim()
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                    </div>
                    ) : (
                    <>
                        {isReply ? '↩️ Enviar Resposta' : '📤 Enviar Email'}
                    </>
                    )}
                </button>
                </div>
            </div>
            </div>
        </form>

        {/* IA Preview (opcional) */}
        {!isReply && formData.body.trim() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🤖 Pré-visualização IA
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Quando enviado, este email será automaticamente classificado como produtivo ou improdutivo pela nossa IA, 
                e uma resposta sugerida será gerada para o destinatário.
            </p>
            </div>
        )}
    </div>
    )
}
