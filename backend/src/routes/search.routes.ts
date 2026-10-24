import { Router } from 'express';
import { searchArticles } from '../controllers/search.controller';

const router = Router();

router.get('/', searchArticles);

export default router;
