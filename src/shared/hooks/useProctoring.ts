import { useEffect, useCallback, useRef } from 'react';

interface ProctoringConfig {
    studentId: string;
    courseId: string;
    attemptId: string;
    enabled: boolean;
}

export const useProctoring = ({ studentId, courseId, attemptId, enabled }: ProctoringConfig) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

    const logEvent = useCallback((eventType: string, details: any = {}) => {
        if (!enabled) return;

        const payload = JSON.stringify({
            studentId,
            courseId,
            attemptId,
            eventType,
            details,
            timestamp: new Date().toISOString()
        });

        // Use sendBeacon for reliable logging even when page is closed
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${backendUrl}/api/student/track/proctor/ingest`, payload);
        } else {
            fetch(`${backendUrl}/api/student/track/proctor/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true
            }).catch(err => console.error('Proctoring Log Error:', err));
        }
    }, [studentId, courseId, attemptId, enabled, backendUrl]);

    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logEvent('tab-switch', { state: 'hidden' });
            }
        };

        const handleBlur = () => {
            logEvent('window-blur');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                logEvent('exit-fullscreen');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [enabled, logEvent]);

    const requestFullscreen = useCallback(() => {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error('Fullscreen request failed:', err);
            });
        }
    }, []);

    return { requestFullscreen, logEvent };
};
