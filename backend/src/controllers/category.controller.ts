import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { articles: { where: { status: 'PUBLISHED' } } },
            },
          },
        },
        _count: {
          select: { articles: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    // Separate into top-level categories with their children
    const rootCategories = categories
      .filter((cat) => !cat.parentId)
      .map((cat) => ({
        ...cat,
        articleCount: cat._count.articles,
        children: cat.children.map((child) => ({
          ...child,
          articleCount: child._count.articles,
        })),
      }));

    return sendSuccess(res, rootCategories, 'Lấy danh mục thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh mục', 500);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { articles: { where: { status: 'PUBLISHED' } } },
            },
          },
        },
        _count: {
          select: { articles: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Danh mục không tồn tại', 404);
    }

    return sendSuccess(res, category, 'Lấy thông tin danh mục thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy thông tin danh mục', 500);
  }
};

export const getTags = async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    const formatted = tags.map((t) => ({
      ...t,
      articleCount: t._count.articles,
    }));

    return sendSuccess(res, formatted, 'Lấy danh sách thẻ thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách thẻ', 500);
  }
};

export const getTagBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!tag) {
      return sendError(res, 'Thẻ tag không tồn tại', 404);
    }

    return sendSuccess(
      res,
      { ...tag, articleCount: tag._count.articles },
      'Lấy thông tin thẻ thành công'
    );
  } catch (error) {
    return sendError(res, 'Lỗi lấy thông tin thẻ', 500);
  }
};
