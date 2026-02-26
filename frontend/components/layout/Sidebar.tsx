import React from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Terminal,
    FileText,
    User,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    Bot,
    ClipboardCheck,
    Shield,
    Users,
    StickyNote,
    Award,
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const navGroups = [
    {
        label: 'Learn',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'videos', label: 'Videos', icon: Video },
            { id: 'labs', label: 'Labs', icon: Terminal },
        ],
    },
    {
        label: 'Practice',
        items: [
            { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
            { id: 'interview', label: 'AI Interview', icon: Bot },
            { id: 'resume', label: 'Resume', icon: FileText },
            { id: 'notes', label: 'Notes', icon: StickyNote },
        ],
    },
    {
        label: 'Connect',
        items: [
            { id: 'community', label: 'Community', icon: Users },
            { id: 'career', label: 'Career', icon: Briefcase },
            { id: 'certificates', label: 'Certificates', icon: Award },
        ],
    },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const { logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'labs', label: 'Labs', icon: Terminal },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'career', label: 'Career', icon: Briefcase },
        { id: 'interview', label: 'AI Interview', icon: Bot },
        { id: 'resume', label: 'Resume', icon: FileText },
        { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
    ];


    return (
        <div
            className={cn(
                '    flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30 transition-all duration-300 ease-in-out',
                'bg-[#0a0d0a] border-r border-[#00ff88]/10',
                isCollapsed ? 'w-[64px]' : 'w-60'
            )}
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-[#0a0d0a] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/10 transition-all shadow-lg shadow-black/50"
                title={isCollapsed ? 'Expand' : 'Collapse'}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </button>

            {/* Scrollable Nav */}
            <div className={cn(
                'flex-1 overflow-y-auto cc-scrollbar flex flex-col gap-5',
                isCollapsed ? 'p-2 pt-5' : 'px-3 pt-5 pb-3'
            )}>
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-0.5">
                        {!isCollapsed && (
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#00ff88]/40 px-3 mb-2">
                                {group.label}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onTabChange(item.id)}
                                    title={isCollapsed ? item.label : ''}
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                                        isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5',
                                        isActive
                                            ? 'bg-[#00ff88]/10 text-[#00ff88] shadow-[inset_0_0_0_1px_rgba(0,255,136,0.2)]'
                                            : 'text-[#5a7a5a] hover:bg-[#00ff88]/5 hover:text-[#ccffcc]'
                                    )}
                                >
                                    <Icon className={cn(
                                        'h-4 w-4 shrink-0 transition-colors',
                                        isActive ? 'text-[#00ff88]' : 'text-[#3d6b3d] group-hover:text-[#00ff88]'
                                    )} />
                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className={cn(
                'border-t border-[#00ff88]/10 bg-[#0a0d0a]',
                isCollapsed ? 'p-2' : 'p-3 space-y-1'
            )}>
                {!isCollapsed && (
                    <button
                        type="button"
                        onClick={() => onTabChange('pricing')}
                        className="w-full mb-2 flex items-center justify-center gap-2 rounded-lg bg-[#00ff88]/8 hover:bg-[#00ff88]/15 border border-[#00ff88]/20 text-[#00ff88] text-xs font-semibold py-2 px-3 transition-all"
                    >
                        <Shield className="h-3 w-3" />
                        Upgrade to Pro
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onTabChange('profile')}
                    title={isCollapsed ? 'Profile' : ''}
                    className={cn(
                        'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all py-2.5',
                        isCollapsed ? 'justify-center' : 'px-3',
                        activeTab === 'profile'
                            ? 'bg-[#00ff88]/10 text-[#00ff88]'
                            : 'text-[#5a7a5a] hover:bg-[#00ff88]/5 hover:text-[#ccffcc]'
                    )}
                >
                    <User className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Profile</span>}
                </button>

                <button
                    type="button"
                    onClick={async () => { try { await logout(); } catch (e) { console.error(e); } }}
                    title={isCollapsed ? 'Sign Out' : ''}
                    className={cn(
                        'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all py-2.5',
                        isCollapsed ? 'justify-center' : 'px-3',
                        'text-[#5a7a5a] hover:bg-red-500/10 hover:text-red-400'
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );
};
