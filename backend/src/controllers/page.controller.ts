import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { cleanHtml } from '../utils/sanitize';
import { createAuditLog } from '../utils/audit';

export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return sendError(res, 'Trang nội dung không tồn tại', 404);
    }

    return sendSuccess(res, page, 'Lấy nội dung trang thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy nội dung trang', 500);
  }
};

export const getAllPages = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const pages = await prisma.staticPage.findMany({
      orderBy: { title: 'asc' },
    });

    return sendSuccess(res, pages, 'Lấy danh sách trang tĩnh thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách trang', 500);
  }
};

export const updatePage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, content, metaTitle, metaDesc } = req.body;

    const existing = await prisma.staticPage.findUnique({ where: { slug } });
    if (!existing) {
      return sendError(res, 'Trang không tồn tại', 404);
    }

    const cleanBody = content !== undefined ? cleanHtml(content) : existing.content;

    const updated = await prisma.staticPage.update({
      where: { slug },
      data: {
        ...(title && { title }),
        content: cleanBody,
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
      },
    });

    await createAuditLog(req, 'UPDATE_PAGE', 'PAGE', slug, `Cập nhật trang tĩnh: ${updated.title}`);

    return sendSuccess(res, updated, 'Cập nhật trang tĩnh thành công');
  } catch (error) {
    return sendError(res, 'Lỗi cập nhật trang tĩnh', 500);
  }
};
