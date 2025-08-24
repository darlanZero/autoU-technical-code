// app/routes/process/process.tsx

import { useState } from "react";

interface ProcessResult {
  category: 'produtivo' | 'improdutivo';
  confidence_score: number;
  suggested_response: string;
  processing_time: number;
}

export default function ProcessEmail({ }) {
  const [emailText, setEmailText] = useState('');
  const [subject, setSubject] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!emailText.trim()) {
      setError('Por favor, insira o conteúdo do email');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/emails/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_content: emailText,
          subject: subject || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar email');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Erro ao processar o email. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearForm = () => {
    setEmailText('');
    setSubject('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🤖 Processador de Emails IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Classifique emails como produtivos ou improdutivos e receba sugestões de resposta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Conteúdo do Email
          </h2>
          
          <div className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assunto (opcional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Problema urgente no sistema"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Email body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo do Email *
              </label>
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Cole o conteúdo do email aqui..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  '🚀 Processar Email'
                )}
              </button>
              <button
                onClick={clearForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resultado da Análise
          </h2>
          
          {result ? (
            <div className="space-y-6">
              {/* Category */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Categoria</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confiança: {(result.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  result.category === 'produtivo'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {result.category === 'produtivo' ? '✅ Produtivo' : '⚠️ Improdutivo'}
                </span>
              </div>

              {/* Suggested Response */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Resposta Sugerida
                </h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {result.suggested_response}
                  </p>
                </div>
              </div>

              {/* Processing Time */}
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Processado em {result.processing_time}s
              </div>

              {/* Copy Response Button */}
              <button
                onClick={() => navigator.clipboard.writeText(result.suggested_response)}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors"
              >
                📋 Copiar Resposta
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-center">
                Insira o conteúdo do email e clique em "Processar" para ver a análise da IA
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}