import { Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { cleanText } from '../utils/sanitize';
import { CommentStatus, Role } from '@prisma/client';

export const getArticleComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { articleId } = req.params;
    const currentUserId = req.user?.id;

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        parentId: null, // Only top-level comments first
        OR: [
          { status: CommentStatus.APPROVED },
          currentUserId ? { userId: currentUserId } : { status: CommentStatus.APPROVED },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
        replies: {
          where: {
            OR: [
              { status: CommentStatus.APPROVED },
              currentUserId ? { userId: currentUserId } : { status: CommentStatus.APPROVED },
            ],
          },
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, comments, 'Lấy danh sách bình luận thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách bình luận', 500);
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Vui lòng đăng nhập để bình luận', 401);
    }

    const { articleId } = req.params;
    const { content, parentId } = req.body;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment || parentComment.articleId !== articleId) {
        return sendError(res, 'Bình luận phản hồi không hợp lệ', 400);
      }
    }

    const sanitizedContent = cleanText(content);
    if (!sanitizedContent) {
      return sendError(res, 'Nội dung bình luận không hợp lệ', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        articleId,
        userId: req.user.id,
        parentId: parentId || null,
        status: CommentStatus.APPROVED, // Direct approval
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return sendSuccess(res, comment, 'Đăng bình luận thành công', 201);
  } catch (error) {
    return sendError(res, 'Lỗi đăng bình luận', 500);
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return sendError(res, 'Bình luận không tồn tại', 404);
    }

    const isOwner = comment.userId === req.user.id;
    const isStaff = ([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR] as Role[]).includes(req.user.role);

    if (!isOwner && !isStaff) {
      return sendError(res, 'Bạn không có quyền xóa bình luận này', 403);
    }

    await prisma.comment.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Xóa bình luận thành công');
  } catch (error) {
    return sendError(res, 'Lỗi xóa bình luận', 500);
  }
};
