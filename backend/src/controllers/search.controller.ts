import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { ArticleStatus } from '@prisma/client';

export const searchArticles = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;
    const sort = (req.query.sort as string) || 'newest';

    if (!q) {
      return sendSuccess(res, [], 'Không có từ khóa tìm kiếm', 200, {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      });
    }

    const where: any = {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
      ],
    };

    let orderBy: any = { publishedAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { publishedAt: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { views: 'desc' };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
          views: true,
          readingTime: true,
          publishedAt: true,
          author: { select: { id: true, fullName: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const formatted = articles.map((art) => ({
      ...art,
      tags: art.tags.map((t) => t.tag),
    }));

    return sendSuccess(
      res,
      formatted,
      `Tìm thấy ${total} kết quả cho "${q}"`,
      200,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        query: q,
      }
    );
  } catch (error) {
    console.error('searchArticles error:', error);
    return sendError(res, 'Lỗi tìm kiếm bài viết', 500);
  }
};
