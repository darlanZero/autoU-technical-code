import { Link } from "react-router";
import { Welcome } from "../welcome/welcome";
import { Layout } from "~/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Organize seus{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                emails com IA
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Sistema inteligente que classifica automaticamente seus emails como produtivos ou improdutivos, 
              e sugere respostas personalizadas usando Hugging Face AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 Começar Grátis
              </Link>
              <Link
                to="/process"
                className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                🤖 Testar IA
              </Link>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <FeatureCard
                icon="🎯"
                title="Classificação Inteligente"
                description="IA avançada classifica emails como produtivos ou improdutivos com alta precisão"
              />
              <FeatureCard
                icon="⚡"
                title="Respostas Automáticas"
                description="Sugestões contextuais de resposta geradas automaticamente pela IA"
              />
              <FeatureCard
                icon="📊"
                title="Dashboard Analítico"
                description="Visualize estatísticas e métricas dos seus emails em tempo real"
              />
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 opacity-50 -z-10"></div>
      </div>
    </Layout>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-center">
        {description}
      </p>
    </div>
  );
}
