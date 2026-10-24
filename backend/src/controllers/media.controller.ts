import { Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import fs from 'fs';
import path from 'path';
import { createAuditLog } from '../utils/audit';

export const uploadMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'Vui lòng chọn tệp tin ảnh để tải lên', 400);
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const media = await prisma.media.create({
      data: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploaderId: req.user!.id,
      },
    });

    await createAuditLog(req, 'UPLOAD_MEDIA', 'MEDIA', media.id, `Tải lên tệp ảnh: ${media.originalName}`);

    return sendSuccess(res, media, 'Tải ảnh lên thành công', 201);
  } catch (error) {
    console.error('uploadMedia error:', error);
    return sendError(res, 'Lỗi tải ảnh lên', 500);
  }
};

export const getMediaList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: { select: { fullName: true } },
        },
      }),
      prisma.media.count(),
    ]);

    return sendSuccess(res, media, 'Lấy danh sách thư viện media thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh mục ảnh', 500);
  }
};

export const deleteMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return sendError(res, 'Tệp tin không tồn tại', 404);
    }

    // Remove physical file from disk
    const filePath = path.resolve(__dirname, '../../uploads', media.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id } });

    await createAuditLog(req, 'DELETE_MEDIA', 'MEDIA', id, `Xóa tệp ảnh: ${media.fileName}`);

    return sendSuccess(res, null, 'Xóa tệp tin thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi xóa tệp tin', 500);
  }
};
