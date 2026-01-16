import { Router, Request, Response } from 'express';
import { Teacher } from '../../models/Teacher.js';

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

    const existing = await Teacher.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Teacher profile already exists' });
      return;
    }

    const newTeacher = await Teacher.create({
      email,
      name,
      organization
    });

    res.status(201).json(newTeacher);
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
});

export default router;
