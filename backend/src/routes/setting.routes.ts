import { Router } from 'express';
import {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} from '../controllers/setting.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public settings (site_name, hotline, etc.)
router.get('/public', getPublicSettings);

// Admin settings
router.get('/', authenticate, requireAdmin, getAdminSettings);
router.patch('/', authenticate, requireAdmin, updateSettings);

export default router;
