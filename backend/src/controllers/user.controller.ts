import { Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            comments: true,
            articles: true,
          },
        },
      },
    });

    return sendSuccess(res, user, 'Lấy thông tin cá nhân thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy thông tin cá nhân', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const { fullName, avatar, bio } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName && { fullName }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        role: true,
        updatedAt: true,
      },
    });

    await createAuditLog(req, 'UPDATE_PROFILE', 'USER', req.user.id, 'Cập nhật thông tin hồ sơ cá nhân');

    return sendSuccess(res, updated, 'Cập nhật thông tin thành công');
  } catch (error) {
    return sendError(res, 'Lỗi cập nhật hồ sơ', 500);
  }
};

export const getMyBookmarks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            coverImage: true,
            publishedAt: true,
            views: true,
            readingTime: true,
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, fullName: true, avatar: true } },
          },
        },
      },
    });

    const articles = bookmarks.map((b) => ({
      ...b.article,
      bookmarkedAt: b.createdAt,
    }));

    return sendSuccess(res, articles, 'Lấy danh sách bài viết đã lưu thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách bài viết đã lưu', 500);
  }
};

export const getMyComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const comments = await prisma.comment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return sendSuccess(res, comments, 'Lấy lịch sử bình luận thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy lịch sử bình luận', 500);
  }
};
