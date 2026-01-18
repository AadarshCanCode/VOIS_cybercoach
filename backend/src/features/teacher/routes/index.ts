import { Router, Request, Response } from 'express';
import { Teacher } from '../../../shared/models/Teacher.js';
import { Course } from '../../../shared/models/Course.js';
import { Enrollment } from '../../../shared/models/Enrollment.js';
import { StudentProgress } from '../../../shared/models/StudentProgress.js';

const router = Router();

// Check if teacher is onboarded
router.get('/profile/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const teacher = await Teacher.findOne({ email });
    res.json({ exists: !!teacher, teacher });
  } catch (error: any) {
    console.error('Check Profile Error:', error);
    res.status(500).json({ message: 'Failed to check profile' });
  }
});

// Onboard new teacher
router.post('/onboarding', async (req: Request, res: Response) => {
  try {
    const { email, name, organization } = req.body;

    if (!email || !name || !organization) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Upsert: Create if new, Update if exists
    const teacher = await Teacher.findOneAndUpdate(
      { email },
      { email, name, organization },
      { upsert: true, new: true }
    );

    res.status(200).json(teacher);
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
});

// Create new course
router.post('/courses', async (req: Request, res: Response) => {
  try {
    const { title, description, code, teacherEmail, modules, published } = req.body;

    if (!title || !description || !code || !teacherEmail) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingCode = await Course.findOne({ code });
    if (existingCode) {
      res.status(400).json({ message: 'Course code already exists' });
      return;
    }

    const newCourse = await Course.create({
      title,
      description,
      code,
      teacherEmail,
      modules: modules || [],
      published: published || false
    });

    res.status(201).json(newCourse);
  } catch (error: any) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// Get teacher's courses
router.get('/courses/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const courses = await Course.find({ teacherEmail: email }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error: any) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get all published courses (for students)
router.get('/courses/public/all', async (req: Request, res: Response) => {
  try {
    console.log('Fetching public courses...');
    const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
    // Transform _id to id
    const transformed = courses.map(c => ({
      ...c.toObject(),
      id: c._id.toString()
    }));
    res.json(transformed);
  } catch (error: any) {
    console.error('Get Public Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch public courses' });
  }
});

// Get single course by ID (public)
router.get('/courses/public/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Transform _id to id
    const transformed = {
      ...course.toObject(),
      id: course._id.toString()
    };

    res.json(transformed);
  } catch (error: any) {
    console.error('Get Course By ID Error:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// Enroll student in course
router.post('/enroll', async (req: Request, res: Response) => {
  try {
    const { studentEmail, courseId, accessCode } = req.body;

    if (!studentEmail || !courseId || !accessCode) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // 1. Verify Course Code
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.code !== accessCode) {
      res.status(403).json({ message: 'Invalid access code' });
      return;
    }

    // 2. Create Enrollment
    // Use upsert to handle potential race conditions or re-enrollments cleanly
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentEmail, courseId },
      {
        studentEmail,
        courseId,
        $setOnInsert: { enrolledAt: new Date() }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, enrollment });
  } catch (error: any) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
});

// Check enrollment status
router.get('/enrollment/:courseId/:studentEmail', async (req: Request, res: Response) => {
  try {
    const { courseId, studentEmail } = req.params;
    const enrollment = await Enrollment.findOne({ courseId, studentEmail });
    res.json({ enrolled: !!enrollment, enrollment });
  } catch (error: any) {
    console.error('Check Enrollment Error:', error);
    res.status(500).json({ message: 'Failed to check enrollment' });
  }
});

// Save student progress
router.post('/progress', async (req: Request, res: Response) => {
  try {
    const { studentEmail, courseId, moduleId, completed, quizScore } = req.body;

    if (!studentEmail || !courseId || !moduleId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const progress = await StudentProgress.findOneAndUpdate(
      { studentEmail, courseId, moduleId },
      {
        studentEmail,
        courseId,
        moduleId,
        completed: completed || false,
        quizScore: quizScore || null,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Also update main Enrollment progress summary
    // Calculate total completed modules for this student & course
    const allProgress = await StudentProgress.find({ studentEmail, courseId, completed: true });
    const completedCount = allProgress.length;

    // We can't easily calculate accurate % without knowing total modules from here efficiently
    // So we might just increment or rely on the frontend/other logic for %
    // For now, let's just ensure the Enrollment record exists so they show up in lists
    await Enrollment.findOneAndUpdate(
      { studentEmail, courseId },
      {
        $max: { lastActiveAt: new Date() },
        $setOnInsert: { enrolledAt: new Date(), progress: 0 }
      },
      { upsert: true }
    );

    res.json({ success: true, progress });
  } catch (error: any) {
    console.error('Save Progress Error:', error);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

// Get course analytics/progress for teacher
router.get('/analytics/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // 1. Get all enrollments for this course
    const enrollments = await Enrollment.find({ courseId });

    // 2. Get detailed progress for these students
    const progressData = await StudentProgress.find({ courseId });

    // 3. Aggregate data
    const analytics = enrollments.map((enrollment: any) => {
      const studentProgress = progressData.filter((p: any) => p.studentEmail === enrollment.studentEmail);
      const completedModules = studentProgress.filter((p: any) => p.completed).length;
      const avgScore = studentProgress.reduce((acc: number, curr: any) => acc + (curr.quizScore || 0), 0) / (studentProgress.filter((p: any) => p.quizScore != null).length || 1);

      return {
        studentEmail: enrollment.studentEmail,
        enrolledAt: enrollment.enrolledAt,
        completedModules,
        avgScore: avgScore || 0,
        lastActive: (enrollment as any).lastActiveAt || enrollment.enrolledAt
      };
    });

    res.json(analytics);
  } catch (error: any) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;
