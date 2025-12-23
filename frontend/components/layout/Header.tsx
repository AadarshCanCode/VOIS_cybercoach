import React from 'react';
import { Shield, User, LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Button } from '../Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogoClick = () => {
        if (user) {
            // If logged in, dispatch event to switch to dashboard tab
            window.dispatchEvent(new CustomEvent('navigateToTab', { detail: { tab: 'dashboard' } }));
        } else {
            // If not logged in, navigate to home
            navigate('/');
        }
    };

    return (
        <header className={`sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl ${className}`}>
            <div className="flex h-16 items-center px-6 gap-4">
                {/* Logo */}
                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 mr-4 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full animate-pulse" />
                        <Shield className="relative h-8 w-8 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:inline-block">
                        Cyber Coach
                    </span>
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center bg-white/5 rounded-lg border border-white/10 focus-within:border-primary/50 focus-within:bg-white/10 transition-all duration-300">
                            <Search className="h-4 w-4 text-muted-foreground ml-3" />
                            <input
                                type="text"
                                placeholder="Search courses, labs, or students..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2 text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {user && (
                        <>
                            <button className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-background" />
                            </button>

                            <div className="h-8 w-[1px] bg-white/10 mx-1" />

                            <div className="flex items-center gap-3 pl-1">
                                <div className="flex-col items-end hidden sm:flex">
                                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                                </div>

                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1px]">
                                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        try {
                                            await logout();
                                        } catch (error) {
                                            console.error('Logout failed:', error);
                                        }
                                    }}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
