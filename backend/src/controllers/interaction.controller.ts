import { Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Vui lòng đăng nhập để thích bài viết', 401);
    }

    const { id: articleId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.articleLike.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    let liked = false;
    if (existingLike) {
      await prisma.articleLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      await prisma.articleLike.create({
        data: {
          articleId,
          userId,
        },
      });
      liked = true;
    }

    const likesCount = await prisma.articleLike.count({
      where: { articleId },
    });

    return sendSuccess(
      res,
      { liked, likesCount },
      liked ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết'
    );
  } catch (error) {
    return sendError(res, 'Lỗi thao tác thích bài viết', 500);
  }
};

export const toggleBookmark = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Vui lòng đăng nhập để lưu bài viết', 401);
    }

    const { id: articleId } = req.params;
    const userId = req.user.id;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    let bookmarked = false;
    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      bookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: {
          articleId,
          userId,
        },
      });
      bookmarked = true;
    }

    return sendSuccess(
      res,
      { bookmarked },
      bookmarked ? 'Đã lưu bài viết vào danh sách yêu thích' : 'Đã xóa bài viết khỏi danh sách yêu thích'
    );
  } catch (error) {
    return sendError(res, 'Lỗi thao tác lưu bài viết', 500);
  }
};
