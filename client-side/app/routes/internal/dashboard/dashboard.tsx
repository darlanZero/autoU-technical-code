// app/routes/dashboard/dashboard.tsx

import { useState, useEffect } from "react";

interface DashboardStats {
  totalEmails: number;
  unreadCount: number;
  productiveEmails: number;
  unproductiveEmails: number;
  processingAccuracy: number;
}

export default function Dashboard({ }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    unreadCount: 0,
    productiveEmails: 0,
    unproductiveEmails: 0,
    processingAccuracy: 0
  });

  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Implementar chamadas para API
      // const response = await fetch('/api/v1/emails?limit=5');
      // setRecentEmails(await response.json());
      
      // Mock data por enquanto
      setStats({
        totalEmails: 156,
        unreadCount: 23,
        productiveEmails: 98,
        unproductiveEmails: 58,
        processingAccuracy: 94.5
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral do sistema de organização de emails
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Emails"
          value={stats.totalEmails}
          icon="📧"
          color="blue"
        />
        <StatCard
          title="Não Lidos"
          value={stats.unreadCount}
          icon="🔴"
          color="red"
        />
        <StatCard
          title="Produtivos"
          value={stats.productiveEmails}
          icon="✅"
          color="green"
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
        {/* Chart placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Emails por Categoria
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600 dark:text-gray-400">
                Gráfico em desenvolvimento
              </p>
            </div>
          </div>
        </div>

        {/* Recent emails */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Emails Recentes
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300">📧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    Email de exemplo #{index + 1}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Classificado como produtivo
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Produtivo
                </span>
              </div>
            ))}
          </div>
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
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    red: 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200',
    green: 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
}