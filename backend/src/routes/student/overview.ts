import type { VercelRequest, VercelResponse } from '@vercel/node';

const sampleProfile = {
    id: 'student-001',
    name: 'Demo Student',
    enrolledCourses: ['netsec-basics', 'ethical-hacking-101'],
    upcomingAssessments: ['assessment-001'],
    lastLogin: new Date().toISOString()
};

const sampleCourses = [
    { id: 'netsec-basics', title: 'Network Security Basics', progress: 0.65 },
    { id: 'ethical-hacking-101', title: 'Ethical Hacking 101', progress: 0.42 }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('[Student] Fetching dashboard summary');

    const completedCourses = sampleCourses.filter(course => course.progress >= 1).length;
    const activeCourses = sampleCourses.length - completedCourses;

    res.status(200).json({
        profile: sampleProfile,
        stats: {
            completedCourses,
            activeCourses,
            courseSummaries: sampleCourses
        }
    });
}
