import { Router } from 'express';
import { toggleLike, toggleBookmark } from '../controllers/interaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/articles/:id/like', authenticate, toggleLike);
router.post('/articles/:id/bookmark', authenticate, toggleBookmark);

export default router;
