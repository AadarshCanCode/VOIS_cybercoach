"use client";
import { CommunityPage } from "@student/components/Community/CommunityPage";
import { useRouter } from "next/navigation";

export default function CommunityPageRoute() {
    const router = useRouter();

    return <CommunityPage onBack={() => router.push("/")} />;
}
