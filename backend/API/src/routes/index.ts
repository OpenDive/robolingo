import { Router } from 'express';
import userRoutes from './UserRoutes';
import courseRoutes from './CourseRoutes';
import lectureRoutes from './LectureRoutes';
import quizRoutes from './QuizRoutes';
import enrollmentRoutes from './EnrollmentRoutes';
import progressRoutes from './ProgressRoutes';

/**
 * Main router that combines all route modules
 * @returns Express Router configured with all API routes
 */
const router = Router();

// Mount feature-specific route modules
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/lectures', lectureRoutes);
router.use('/quizzes', quizRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/progress', progressRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;