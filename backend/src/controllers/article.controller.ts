import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { ArticleStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getArticles = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const categorySlug = req.query.category as string;
    const tagSlug = req.query.tag as string;
    const sort = (req.query.sort as string) || 'newest';

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (categorySlug) {
      where.category = {
        OR: [
          { slug: categorySlug },
          { parent: { slug: categorySlug } },
        ],
      };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: { slug: tagSlug },
        },
      };
    }

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
          isFeatured: true,
          isEditorPick: true,
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: { where: { status: 'APPROVED' } },
              likes: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const formatted = articles.map((art) => ({
      ...art,
      tags: art.tags.map((t) => t.tag),
      commentsCount: art._count.comments,
      likesCount: art._count.likes,
    }));

    return sendSuccess(res, formatted, 'Lấy danh sách bài viết thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getArticles error:', error);
    return sendError(res, 'Lỗi lấy danh sách bài viết', 500);
  }
};

export const getArticleBySlug = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const currentUser = req.user;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: { where: { status: 'APPROVED' } },
            likes: true,
          },
        },
      },
    });

    if (!article) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    // Permission check: if article is not PUBLISHED, only author or editor/admin can view it!
    if (article.status !== ArticleStatus.PUBLISHED) {
      const isAuthor = currentUser && currentUser.id === article.authorId;
      const isStaff = currentUser && ([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR] as Role[]).includes(currentUser.role);
      if (!isAuthor && !isStaff) {
        return sendError(res, 'Bài viết này hiện chưa được xuất bản công khai', 403);
      }
    }

    // Check if current logged-in user liked or bookmarked this article
    let isLiked = false;
    let isBookmarked = false;

    if (currentUser) {
      const [likeRecord, bookmarkRecord] = await Promise.all([
        prisma.articleLike.findUnique({
          where: {
            articleId_userId: {
              articleId: article.id,
              userId: currentUser.id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            articleId_userId: {
              articleId: article.id,
              userId: currentUser.id,
            },
          },
        }),
      ]);

      isLiked = !!likeRecord;
      isBookmarked = !!bookmarkRecord;
    }

    const formatted = {
      ...article,
      tags: article.tags.map((t) => t.tag),
      commentsCount: article._count.comments,
      likesCount: article._count.likes,
      isLiked,
      isBookmarked,
    };

    return sendSuccess(res, formatted, 'Lấy chi tiết bài viết thành công');
  } catch (error) {
    console.error('getArticleBySlug error:', error);
    return sendError(res, 'Lỗi lấy chi tiết bài viết', 500);
  }
};

export const getFeaturedArticles = async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        isFeatured: true,
      },
      take: 6,
      orderBy: { publishedAt: 'desc' },
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
      },
    });

    return sendSuccess(res, articles, 'Lấy danh sách tin nổi bật thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy tin nổi bật', 500);
  }
};

export const getLatestArticles = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string, 10) || 8));

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      take: limit,
      orderBy: { publishedAt: 'desc' },
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
      },
    });

    return sendSuccess(res, articles, 'Lấy danh sách tin mới nhất thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy tin mới nhất', 500);
  }
};

export const getMostViewedArticles = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string, 10) || 5));

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      take: limit,
      orderBy: { views: 'desc' },
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
      },
    });

    return sendSuccess(res, articles, 'Lấy danh sách tin xem nhiều nhất thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy tin xem nhiều', 500);
  }
};

export const getEditorPicks = async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        isEditorPick: true,
      },
      take: 6,
      orderBy: { publishedAt: 'desc' },
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
      },
    });

    return sendSuccess(res, articles, 'Lấy tin biên tập viên đề xuất thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy tin đề xuất', 500);
  }
};

export const getRelatedArticles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const currentArticle = await prisma.article.findUnique({
      where: { id },
      select: {
        categoryId: true,
        tags: { select: { tagId: true } },
      },
    });

    if (!currentArticle) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    const tagIds = currentArticle.tags.map((t) => t.tagId);

    const related = await prisma.article.findMany({
      where: {
        id: { not: id },
        status: ArticleStatus.PUBLISHED,
        OR: [
          { categoryId: currentArticle.categoryId },
          { tags: { some: { tagId: { in: tagIds } } } },
        ],
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        views: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return sendSuccess(res, related, 'Lấy bài viết liên quan thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy bài viết liên quan', 500);
  }
};

export const incrementView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Increment view count in database
    const updated = await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { id: true, views: true },
    });

    return sendSuccess(res, { views: updated.views }, 'Tăng lượt xem thành công');
  } catch (error) {
    return sendError(res, 'Lỗi tăng lượt xem', 500);
  }
};
