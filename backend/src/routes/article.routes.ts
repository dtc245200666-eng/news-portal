import { Router } from 'express';
import {
  getArticles,
  getArticleBySlug,
  getFeaturedArticles,
  getLatestArticles,
  getMostViewedArticles,
  getEditorPicks,
  getRelatedArticles,
  incrementView,
} from '../controllers/article.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getArticles);
router.get('/featured', getFeaturedArticles);
router.get('/latest', getLatestArticles);
router.get('/most-viewed', getMostViewedArticles);
router.get('/editor-picks', getEditorPicks);
router.get('/:slug', optionalAuth, getArticleBySlug);
router.get('/:id/related', getRelatedArticles);
router.post('/:id/view', incrementView);

export default router;
