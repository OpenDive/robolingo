import { Router } from 'express';
import { userController } from '../controllers';
import auth from '../middleware/Auth';
import adminAuth from '../middleware/AdminAuth';
import { loginLimiter } from '../middleware/RateLimit';
import { validate } from '../middleware/Validator';
import { 
  registerValidation, 
  loginValidation, 
  changePasswordValidation,
  updateProfileValidation
} from '../validations/UserValidations';

/**
 * User routes for authentication and profile management
 * @returns Express Router configured with user-related routes
 */
const router = Router();

// Public routes (no authentication required)
router.post('/register', validate(registerValidation), userController.register);
router.post('/login', loginLimiter, validate(loginValidation), userController.login);

// Protected routes (require authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validate(updateProfileValidation), userController.updateProfile);
router.post('/change-password', auth, validate(changePasswordValidation), userController.changePassword);

// Admin routes
router.get('/by-role/:role', auth, adminAuth, userController.getUsersByRole);
router.put('/:id/status', auth, adminAuth, userController.setActiveStatus);
router.put('/:id/role', auth, adminAuth, userController.changeRole);

// Standard CRUD routes
router.get('/', auth, adminAuth, userController.getAll);
router.get('/:id', auth, adminAuth, userController.getById);
router.put('/:id', auth, adminAuth, userController.update);
router.delete('/:id', auth, adminAuth, userController.delete);

export default router;