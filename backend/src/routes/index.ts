import { Router } from 'express';
import authRoutes from './auth.routes';
import articleRoutes from './article.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import commentRoutes from './comment.routes';
import interactionRoutes from './interaction.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import mediaRoutes from './media.routes';
import pageRoutes from './page.routes';
import settingRoutes from './setting.routes';
import contactRoutes from './contact.routes';
import searchRoutes from './search.routes';
import feedRoutes from './feed.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/comments', commentRoutes);
router.use('/interactions', interactionRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/media', mediaRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingRoutes);
router.use('/contact', contactRoutes);
router.use('/search', searchRoutes);
router.use('/', feedRoutes);

export default router;
