import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "~/api/authContext";
import { emailService, type DashboardStats, type EmailResponse } from "~/api/emails";

export default function Dashboard() {
  const { state } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    unreadCount: 0,
    productiveEmails: 0,
    unproductiveEmails: 0,
    processingAccuracy: 0
  });
  const [recentEmails, setRecentEmails] = useState<EmailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.user) {
      fetchDashboardData();
    }
  }, [state.user]);

  const fetchDashboardData = async () => {
    if (!state.user) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Buscar estatísticas
      const dashboardStats = await emailService.getDashboardStats(state.user.$id);
      setStats(dashboardStats);

      // Buscar emails recentes
      const inbox = await emailService.getInbox(state.user.$id, 5);
      setRecentEmails(inbox.emails);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Bem-vindo de volta, {state.user?.name}! Aqui está um resumo dos seus emails.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Emails"
          value={stats.totalEmails}
          icon="📧"
          color="blue"
          href="/emails"
        />
        <StatCard
          title="Não Lidos"
          value={stats.unreadCount}
          icon="🔴"
          color="red"
          href="/emails?filter=unread"
        />
        <StatCard
          title="Produtivos"
          value={stats.productiveEmails}
          icon="✅"
          color="green"
          href="/emails?filter=produtivo"
        />
        <StatCard
          title="Precisão IA"
          value={`${stats.processingAccuracy}%`}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição de Emails
          </h3>
          <div className="space-y-4">
            {/* Productive bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 dark:text-green-400">Produtivos</span>
                <span className="text-gray-500 dark:text-gray-400">{stats.productiveEmails}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: stats.totalEmails > 0 
                      ? `${(stats.productiveEmails / stats.totalEmails) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Unproductive bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 dark:text-yellow-400">Improdutivos</span>
                <span className="text-gray-500 dark:text-gray-400">{stats.unproductiveEmails}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: stats.totalEmails > 0 
                      ? `${(stats.unproductiveEmails / stats.totalEmails) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>

            {/* Unread bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 dark:text-red-400">Não Lidos</span>
                <span className="text-gray-500 dark:text-gray-400">{stats.unreadCount}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: stats.totalEmails > 0 
                      ? `${(stats.unreadCount / stats.totalEmails) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent emails */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Emails Recentes
            </h3>
            <Link 
              to="/emails" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Ver todos →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentEmails.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum email recente
                </p>
              </div>
            ) : (
              recentEmails.map((email) => (
                <Link
                  key={email.$id}
                  to={`/emails/${email.$id}`}
                  className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300">
                      {email.is_read ? '📖' : '📧'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {email.subject}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      De: {email.sender} • {formatDate(email.$createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    email.category === 'produtivo'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {email.category === 'produtivo' ? '✅' : '⚠️'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/emails/compose"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">✉️</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Novo Email</span>
          </Link>
          
          <Link
            to="/emails?filter=unread"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">🔴</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Não Lidos</span>
          </Link>
          
          <Link
            to="/process"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">🤖</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Processar IA</span>
          </Link>
          
          <Link
            to="/emails/sent"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-2xl mb-2">📤</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Enviados</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'red' | 'green' | 'purple';
  href?: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    red: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200',
    green: 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
  };

  const card = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return href ? <Link to={href}>{card}</Link> : card;
}