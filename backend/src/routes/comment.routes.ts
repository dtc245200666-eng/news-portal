import { Router } from 'express';
import {
  getArticleComments,
  createComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { commentSchema } from '../validators/common.validator';
import { commentLimiter } from '../middlewares/rate-limiter.middleware';

const router = Router();

router.get('/articles/:articleId', optionalAuth, getArticleComments);
router.post('/articles/:articleId', authenticate, commentLimiter, validate(commentSchema), createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
