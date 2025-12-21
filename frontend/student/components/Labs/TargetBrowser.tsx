import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

interface TargetBrowserProps {
    initialUrl?: string;
}

export const TargetBrowser: React.FC<TargetBrowserProps> = ({ initialUrl = 'http://vulnerable-bank.lab:8080' }) => {
    const [url, setUrl] = useState(initialUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        loadUrl(url);
    }, []);

    const loadUrl = (targetUrl: string) => {
        setIsLoading(true);
        setUrl(targetUrl);

        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false);
            renderContent(targetUrl);
        }, 800);
    };

    const renderContent = (targetUrl: string) => {
        if (targetUrl.includes('vulnerable-bank')) {
            setContent(<VulnerableBankApp />);
        } else if (targetUrl.includes('shop.vulnerable')) {
            setContent(<VulnerableShopApp />);
        } else {
            setContent(
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Globe className="h-16 w-16 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">Site Not Found</h2>
                    <p>DNS_PROBE_FINISHED_NXDOMAIN</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-xl">
            {/* Browser Toolbar */}
            <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center space-x-2">
                <div className="flex space-x-1 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                <div className="flex items-center space-x-2 text-gray-500">
                    <ArrowLeft className="h-4 w-4 cursor-pointer hover:text-gray-700" />
                    <ArrowRight className="h-4 w-4 cursor-pointer hover:text-gray-700" />
                    <RefreshCw className={`h-4 w-4 cursor-pointer hover:text-gray-700 ${isLoading ? 'animate-spin' : ''}`} onClick={() => loadUrl(url)} />
                </div>

                <div className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm flex items-center space-x-2">
                    <Lock className="h-3 w-3 text-green-600" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadUrl(url)}
                        className="flex-1 outline-none text-gray-700"
                    />
                </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 overflow-auto bg-white relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {content}
            </div>
        </div>
    );
};

// Vulnerable Applications Components

const VulnerableBankApp = () => {
    const [page, setPage] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate SQL Injection vulnerability
        if (username.includes("'") || username.includes("OR 1=1")) {
            setPage('dashboard');
        } else if (username === 'admin' && password === 'admin123') {
            setPage('dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    if (page === 'dashboard') {
        return (
            <div className="p-8 bg-gray-50 min-h-full">
                <nav className="bg-blue-900 text-white p-4 rounded-lg mb-8 flex justify-between items-center">
                    <span className="font-bold text-xl">Vulnerable Bank</span>
                    <div className="flex space-x-4">
                        <span>Accounts</span>
                        <span>Transfers</span>
                        <span>Profile</span>
                        <button onClick={() => setPage('login')} className="text-blue-200">Logout</button>
                    </div>
                </nav>

                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                <span>Checking (...8842)</span>
                                <span className="font-mono font-bold">$1,337,420.00</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span>Savings (...9931)</span>
                                <span className="font-mono font-bold">$50,000.00</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2">Description</th>
                                    <th className="pb-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-2">2024-03-15</td>
                                    <td>Payroll Deposit</td>
                                    <td className="text-right text-green-600">+$5,000.00</td>
                                </tr>
                                <tr>
                                    <td className="py-2">2024-03-14</td>
                                    <td>Coffee Shop</td>
                                    <td className="text-right text-gray-600">-$4.50</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Lock className="text-white h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Secure Login</h1>
                    <p className="text-gray-500">Welcome to Vulnerable Bank</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition-colors font-medium"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Protected by 256-bit encryption</p>
                </div>
            </div>
        </div>
    );
};

const VulnerableShopApp = () => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate XSS
        if (search.includes('<script>')) {
            alert('XSS Vulnerability Triggered! Cookie: JSESSIONID=12345');
        }
        setResults(['Product A', 'Product B', 'Product C']);
    };

    return (
        <div className="min-h-full bg-white">
            <header className="bg-indigo-600 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Vulnerable Shop</h1>
                    <form onSubmit={handleSearch} className="flex">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="px-4 py-1 rounded-l text-gray-900 outline-none"
                        />
                        <button type="submit" className="bg-indigo-800 px-4 py-1 rounded-r hover:bg-indigo-900">Search</button>
                    </form>
                </div>
            </header>

            <main className="container mx-auto p-8">
                <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-200 rounded mb-4" />
                            <h3 className="font-bold mb-2">Product {i}</h3>
                            <p className="text-gray-600 text-sm mb-4">Lorem ipsum dolor sit amet.</p>
                            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Add to Cart</button>
                        </div>
                    ))}
                </div>

                {search && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <h3 className="font-bold text-yellow-800 mb-2">Search Results for: <span dangerouslySetInnerHTML={{ __html: search }} /></h3>
                        <p className="text-sm text-yellow-700">Found {results.length} items.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
