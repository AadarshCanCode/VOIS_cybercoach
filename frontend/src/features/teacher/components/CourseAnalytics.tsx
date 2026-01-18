import React, { useState, useEffect } from 'react';

interface StudentAnalytics {
    studentEmail: string;
    enrolledAt: string;
    completedModules: number;
    avgScore: number;
    lastActive: string;
}

interface CourseAnalyticsProps {
    courseId: string;
    courseTitle: string;
    onBack: () => void;
}

export const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId, courseTitle, onBack }) => {
    const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiBase}/api/teacher/analytics/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">{courseTitle} - Student Progress</h2>
                    <button onClick={onBack} className="text-sm text-emerald-500 hover:text-emerald-400 mt-1">
                        ← Back to Dashboard
                    </button>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : analytics.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <p>No students enrolled yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="p-4 text-slate-400 font-medium">Student</th>
                                <th className="p-4 text-slate-400 font-medium">Joined</th>
                                <th className="p-4 text-slate-400 font-medium">Modules Completed</th>
                                <th className="p-4 text-slate-400 font-medium">Avg Quiz Score</th>
                                <th className="p-4 text-slate-400 font-medium">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.map((student) => (
                                <tr key={student.studentEmail} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                    <td className="p-4 font-mono text-emerald-400">{student.studentEmail}</td>
                                    <td className="p-4 text-slate-300">{new Date(student.enrolledAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-300">
                                        <span className="inline-block px-2 py-1 bg-slate-800 rounded text-xs font-bold">
                                            {student.completedModules}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {student.avgScore > 0 ? (
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${student.avgScore >= 80 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {Math.round(student.avgScore)}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(student.lastActive).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
