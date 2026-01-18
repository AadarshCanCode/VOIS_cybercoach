import * as React from "react"
import {
    LayoutDashboard,
    BookOpen,
    Terminal,
    Video,
    ClipboardCheck,
    User,
    LogOut,
    ChevronRight,
} from "lucide-react"

import { useAuth } from "@context/AuthContext"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@shared/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
    const { logout } = useAuth()

    const navMain = [
        {
            title: "Navigation",
            items: [
                {
                    title: "Dashboard",
                    id: "dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Courses",
                    id: "courses",
                    icon: BookOpen,
                },
                {
                    title: "Labs",
                    id: "labs",
                    icon: Terminal,
                },
            ],
        },
        {
            title: "Community & Help",
            items: [

                {
                    title: "Videos",
                    id: "videos",
                    icon: Video,
                },
                // {
                //     title: "Assessment",
                //     id: "assessment",
                //     icon: ClipboardCheck,
                // },
            ],
        },
        {
            title: "Account",
            items: [
                {
                    title: "Profile",
                    id: "profile",
                    icon: User,
                },
            ],
        },
    ]

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-sidebar-border/50">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:!p-0 transition-all duration-200">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground transition-all duration-200">
                                <img src="/cybercoach-logo.png" alt="Cybercoach Logo" className="size-8 object-contain" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                                <span className="truncate font-bold text-lg tracking-tight uppercase">
                                    Cyber<span className="text-[#00FF88]">coach</span>
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={activeTab === item.id}
                                            onClick={() => onTabChange(item.id)}
                                            className={activeTab === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}
                                        >
                                            <item.icon className="size-4 shrink-0 transition-all duration-200 group-data-[state=collapsed]:mx-auto" />
                                            <span className="transition-opacity duration-200 group-data-[state=collapsed]:hidden truncate">
                                                {item.title}
                                            </span>
                                            {activeTab === item.id && (
                                                <ChevronRight className="ml-auto size-3 opacity-50 transition-opacity duration-200 group-data-[state=collapsed]:hidden" />
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>

                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={async () => {
                                        try {
                                            await logout()
                                        } catch (error) {
                                            console.error("Logout failed:", error)
                                        }
                                    }}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="size-4 shrink-0 transition-all duration-200 group-data-[state=collapsed]:mx-auto" />
                                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:hidden">
                                        Sign Out
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
