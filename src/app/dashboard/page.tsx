"use client";
import { StudentAppContent } from "@student/components/StudentAppContent";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "dashboard";

    return <StudentAppContent initialTab={tab} />;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]"></div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
