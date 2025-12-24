import React from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart,
    LogOut,
    ChevronRight,
    Settings,
    Shield
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
    const { logout } = useAuth();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'courses', label: 'Manage Courses', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-72 bg-[#0A0F0A] border-r border-[#00FF88]/10 h-[calc(100vh-4rem)] flex flex-col sticky top-16 z-30">
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#00FF88]/5 text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.15)] border border-[#00FF88]/20'
                                        : 'text-[#00B37A] hover:text-[#EAEAEA] hover:bg-[#00FF88]/5 border border-transparent hover:shadow-lg hover:shadow-[#00FF88]/5'
                                )
                                }
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-all duration-300",
                                    isActive ? "bg-[#00FF88]/10" : "bg-[#00FF88]/5 group-hover:bg-[#00FF88]/10"
                                )}>
                                    <Icon className={cn(
                                        "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-[#00FF88]" : "text-[#00B37A] group-hover:text-[#EAEAEA]"
                                    )} />
                                </div>

                                <span className="font-medium tracking-wide text-sm">{item.label}</span>

                                {isActive && (
                                    <div className="absolute right-3 animate-fade-in">
                                        <ChevronRight className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-[#00FF88]/10 bg-[#0A0F0A]/50 backdrop-blur-sm relative z-10">
                <div className="mb-4 px-4 py-3 bg-gradient-to-br from-[#0A0F0A] to-[#000000] rounded-xl border border-[#00FF88]/10 shadow-inner">
                    <p className="text-xs font-medium text-[#00B37A] uppercase tracking-wider mb-2">Clearance Level</p>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-2xl font-bold text-[#EAEAEA]">
                                Administrator
                            </p>
                            <p className="text-xs text-[#00FF88]">
                                Level 5 Access
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Shield className="h-5 w-5 text-red-400" />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-[#00B37A] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};
