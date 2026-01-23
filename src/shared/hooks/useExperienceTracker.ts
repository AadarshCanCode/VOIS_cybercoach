import { useEffect, useRef } from 'react';

interface ExperienceDetail {
    moduleId: string;
    timeSpent: number; // seconds
    scrollDepth: number; // percentage (0-100)
}

interface ExperienceConfig {
    studentId: string;
    courseId: string;
    moduleId: string;
    enabled: boolean;
}

export const useExperienceTracker = ({ studentId, courseId, moduleId, enabled }: ExperienceConfig) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const startTimeRef = useRef<number>(Date.now());
    const maxScrollRef = useRef<number>(0);
    const scrollRequestRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        startTimeRef.current = Date.now();
        maxScrollRef.current = 0;

        const handleScroll = () => {
            if (scrollRequestRef.current) return;

            scrollRequestRef.current = requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                if (docHeight > 0) {
                    const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
                    maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
                }
                scrollRequestRef.current = null;
            });
        };

        window.addEventListener('scroll', handleScroll);

        // Sync data periodically (heartbeat every 30s) or on unmount
        const syncData = () => {
            const timeSpent = (Date.now() - startTimeRef.current) / 1000;
            const payload = JSON.stringify({
                studentId,
                courseId,
                moduleStats: {
                    moduleId,
                    timeSpent,
                    scrollDepth: Math.round(maxScrollRef.current)
                }
            });

            if (navigator.sendBeacon) {
                navigator.sendBeacon(`${backendUrl}/api/student/track/experience/sync`, payload);
            } else {
                fetch(`${backendUrl}/api/student/track/experience/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(err => console.error('Experience Sync Error:', err));
            }

            // Reset timer for next interval if kept alive, but usually we just sync on unmount/interval
            startTimeRef.current = Date.now();
        };

        const intervalId = setInterval(syncData, 30000); // 30 seconds heartbeat

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollRequestRef.current) {
                cancelAnimationFrame(scrollRequestRef.current);
            }
            clearInterval(intervalId);
            syncData(); // Final sync on unmount/module change
        };
    }, [studentId, courseId, moduleId, enabled, backendUrl]);

    return {};
};
