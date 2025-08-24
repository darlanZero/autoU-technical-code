import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

export default function InternalLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: "📊" },
        { name: "Emails", href: "/emails", icon: "📧" },
        { name: "Processar", href: "/process", icon: "🤖" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link 
                                to="/dashboard" 
                                className="flex items-center space-x-2"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">📬</span>
                                </div>
                                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Email Organizer
                                </span>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        location.pathname === item.href
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">👤</span>
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-200">Admin</span>
                            </div>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}