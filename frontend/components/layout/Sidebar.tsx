import React from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Terminal,
    Award,
    FileText,
    User,
    LogOut,
    ChevronRight,
    Briefcase,
    Bot,
    ClipboardCheck,
    Shield
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const { logout, isTeacher, isAdmin } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'labs', label: 'Labs', icon: Terminal },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'certificates', label: 'Certificates', icon: Award },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'career', label: 'Career', icon: Briefcase },
        { id: 'interview', label: 'AI Interview', icon: Bot },
        { id: 'resume', label: 'Resume', icon: FileText },
        { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    ];

    if (isTeacher()) {
        // Add teacher specific items
    }

    if (isAdmin()) {
        // Add admin specific items
    }

    return (
        <div className="w-72 bg-[#0A0F0A] border-r border-[#00FF88]/10 h-[calc(100vh-4rem)] flex flex-col sticky top-16">
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
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

            <div className="p-4 border-t border-[#00FF88]/10 bg-[#0A0F0A]/50 backdrop-blur-sm">
                <button
                    onClick={() => onTabChange('profile')}
                    className={cn(
                        "w-full mb-3 flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        activeTab === 'profile'
                            ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#00FF88]/5 text-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.15)] border border-[#00FF88]/20'
                            : 'text-[#00B37A] hover:text-[#EAEAEA] hover:bg-[#00FF88]/5 border border-transparent hover:shadow-lg hover:shadow-[#00FF88]/5'
                    )}
                >
                    <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        activeTab === 'profile' ? "bg-[#00FF88]/10" : "bg-[#00FF88]/5 group-hover:bg-[#00FF88]/10"
                    )}>
                        <User className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            activeTab === 'profile' ? "text-[#00FF88]" : "text-[#00B37A] group-hover:text-[#EAEAEA]"
                        )} />
                    </div>
                    <span className="font-medium tracking-wide text-sm">Profile</span>
                </button>

                <button
                    onClick={() => onTabChange('pricing')}
                    className="w-full mb-3 bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] text-xs font-bold py-2 px-3 rounded border border-[#00FF88]/20 transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                >
                    <Shield className="h-3 w-3" />
                    Upgrade Clearance
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-[#00B37A] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300 group"
                >
                    <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};
