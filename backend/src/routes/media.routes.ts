import { Router } from 'express';
import { uploadMedia, getMediaList, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireStaff, requireAdmin } from '../middlewares/role.middleware';
import { uploadImage } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload', requireStaff, uploadImage.single('file'), uploadMedia);
router.get('/', requireStaff, getMediaList);
router.delete('/:id', requireAdmin, deleteMedia);

export default router;
