"use client";
import { useAuth } from "@context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@shared/components/ui/sidebar";
import { AppSidebar } from "@shared/components/layout/AppSidebar";
import { DashboardHeader } from "@shared/components/layout/DashboardHeader";
import { StickyBanner } from "@shared/components/ui/sticky-banner";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88] mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Get active tab from pathname
    const getActiveTab = () => {
        if (pathname?.startsWith("/courses")) return "courses";
        if (pathname?.startsWith("/labs")) return "labs";
        if (pathname?.startsWith("/videos")) return "videos";
        if (pathname?.startsWith("/certificates")) return "certificates";
        if (pathname?.startsWith("/profile")) return "profile";
        if (pathname?.startsWith("/community")) return "community";
        if (pathname?.startsWith("/proctor-demo")) return "proctor-demo";
        return "dashboard";
    };

    const activeTab = getActiveTab();

    const handleTabChange = (tab: string) => {
        const routes: Record<string, string> = {
            dashboard: "/dashboard",
            courses: "/courses",
            labs: "/labs",
            videos: "/videos",
            certificates: "/certificates",
            profile: "/profile",
            community: "/community",
            "proctor-demo": "/proctor-demo",
        };
        const route = routes[tab] || "/dashboard";
        router.push(route);
    };

    const isFullPage = pathname === "/community";

    if (isFullPage) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-50">
                <StickyBanner className="bg-blue-600 border-none shrink-0 pointer-events-auto">
                    <p className="text-xs font-medium text-white tracking-wide text-center px-4">
                        Announcing the Cybercoach Community. Connect with elite operatives and share tactical intel.{" "}
                        <button
                            onClick={() => router.push("/community")}
                            className="text-white font-black hover:underline ml-2 uppercase tracking-tighter"
                        >
                            Join Community &rarr;
                        </button>
                    </p>
                </StickyBanner>
            </div>
            <SidebarProvider className="dark w-full bg-background text-foreground">
                <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
                <SidebarInset>
                    <div className="sticky top-0 z-40">
                        <DashboardHeader activeTab={activeTab} onTabChange={handleTabChange} />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}

