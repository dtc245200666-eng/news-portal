import { Router } from 'express';
import { getTags, getTagBySlug } from '../controllers/category.controller';

const router = Router();

router.get('/', getTags);
router.get('/:slug', getTagBySlug);

export default router;
