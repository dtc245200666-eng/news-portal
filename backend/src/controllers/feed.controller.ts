import { Request, Response } from 'express';
import prisma from '../config/prisma';
import RSS from 'rss';
import { ArticleStatus } from '@prisma/client';

export const getRssFeed = async (req: Request, res: Response) => {
  try {
    const host = req.get('host') || 'localhost:5000';
    const siteUrl = `http://${host}`;

    const feed = new RSS({
      title: 'NewsPortal - Cổng Thông Tin Điện Tử',
      description: 'Cập nhật tin tức nhanh nhất, nóng hổi nhất trong ngày.',
      feed_url: `${siteUrl}/api/v1/rss`,
      site_url: siteUrl,
      language: 'vi',
      pubDate: new Date(),
    });

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      take: 20,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { fullName: true } },
        category: { select: { name: true } },
      },
    });

    articles.forEach((art) => {
      feed.item({
        title: art.title,
        description: art.summary,
        url: `${siteUrl}/bai-viet/${art.slug}`,
        author: art.author.fullName,
        categories: [art.category.name],
        date: art.publishedAt || art.createdAt,
      });
    });

    res.set('Content-Type', 'application/xml');
    return res.send(feed.xml({ indent: true }));
  } catch (error) {
    console.error('RSS Feed error:', error);
    return res.status(500).send('Lỗi tạo RSS Feed');
  }
};

export const getSitemapXml = async (req: Request, res: Response) => {
  try {
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `http://${host}`;

    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
        take: 100,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticUrls = [
      '',
      '/gioi-thieu',
      '/lien-he',
      '/chinh-sach-bao-mat',
      '/dieu-khoan-su-dung',
      '/chinh-sach-binh-luan',
    ];

    staticUrls.forEach((path) => {
      xml += `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    });

    // Categories
    categories.forEach((cat) => {
      xml += `  <url>\n    <loc>${baseUrl}/danh-muc/${cat.slug}</loc>\n    <lastmod>${cat.updatedAt.toISOString()}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Articles
    articles.forEach((art) => {
      xml += `  <url>\n    <loc>${baseUrl}/bai-viet/${art.slug}</loc>\n    <lastmod>${art.updatedAt.toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    return res.status(500).send('Lỗi tạo Sitemap');
  }
};

export const getRobotsTxt = async (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:5000';
  const content = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: http://${host}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain');
  return res.send(content);
};
