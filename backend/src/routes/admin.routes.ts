import { Router } from 'express';
import {
  getDashboardStats,
  getAdminArticles,
  getAdminArticleById,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  getAdminUsers,
  toggleUserLock,
  changeUserRole,
  getAdminComments,
  updateCommentStatus,
  getAdminAuditLogs,
} from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireEditor, requireAdmin, requireStaff } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createArticleSchema, updateArticleSchema } from '../validators/article.validator';
import { categorySchema, tagSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

// Dashboard stats (Staff: Author/Editor/Admin/SuperAdmin)
router.get('/dashboard', requireStaff, getDashboardStats);

// Articles management (Staff can create/edit own, Editor/Admin can manage all)
router.get('/articles', requireStaff, getAdminArticles);
router.get('/articles/:id', requireStaff, getAdminArticleById);
router.post('/articles', requireStaff, validate(createArticleSchema), createAdminArticle);
router.patch('/articles/:id', requireStaff, validate(updateArticleSchema), updateAdminArticle);
router.delete('/articles/:id', requireStaff, deleteAdminArticle);

// Categories management (Editor / Admin)
router.post('/categories', requireEditor, validate(categorySchema), createCategory);
router.patch('/categories/:id', requireEditor, validate(categorySchema.partial()), updateCategory);
router.delete('/categories/:id', requireAdmin, deleteCategory);

// Tags management (Editor / Admin)
router.post('/tags', requireEditor, validate(tagSchema), createTag);
router.patch('/tags/:id', requireEditor, validate(tagSchema.partial()), updateTag);
router.delete('/tags/:id', requireAdmin, deleteTag);

// User management (Admin / Super Admin only)
router.get('/users', requireAdmin, getAdminUsers);
router.patch('/users/:id/toggle-lock', requireAdmin, toggleUserLock);
router.patch('/users/:id/role', requireAdmin, changeUserRole);

// Comments management (Editor / Admin)
router.get('/comments', requireEditor, getAdminComments);
router.patch('/comments/:id/status', requireEditor, updateCommentStatus);

// Audit logs (Admin / Super Admin only)
router.get('/audit-logs', requireAdmin, getAdminAuditLogs);

export default router;
