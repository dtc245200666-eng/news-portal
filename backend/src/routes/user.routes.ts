import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getMyBookmarks,
  getMyComments,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.get('/me/bookmarks', getMyBookmarks);
router.get('/me/comments', getMyComments);

export default router;
