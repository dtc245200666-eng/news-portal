import { Router } from 'express';
import { getPageBySlug, getAllPages, updatePage } from '../controllers/page.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public
router.get('/:slug', getPageBySlug);

// Admin
router.get('/', authenticate, requireAdmin, getAllPages);
router.patch('/:slug', authenticate, requireAdmin, updatePage);

export default router;
