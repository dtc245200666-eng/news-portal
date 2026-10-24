import { Router } from 'express';
import { getRssFeed, getSitemapXml, getRobotsTxt } from '../controllers/feed.controller';

const router = Router();

router.get('/rss', getRssFeed);
router.get('/sitemap.xml', getSitemapXml);
router.get('/robots.txt', getRobotsTxt);

export default router;
