import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { config } from '../config';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled Application Error:', err);

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 5MB).', 400);
    }
    return sendError(res, `Lỗi tải tệp tin: ${err.message}`, 400);
  }

  // Handle Prisma unique constraint error
  if (err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) || [];
    return sendError(
      res,
      `Dữ liệu đã tồn tại trong hệ thống (${fields.join(', ')}).`,
      409
    );
  }

  // Handle Prisma record not found error
  if (err.code === 'P2025') {
    return sendError(res, 'Bản ghi yêu cầu không tồn tại hoặc đã bị xóa.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã có lỗi xảy ra trên máy chủ';

  const responsePayload = config.nodeEnv === 'development'
    ? { message, stack: err.stack }
    : { message: statusCode === 500 ? 'Lỗi máy chủ nội bộ. Vui lòng liên hệ quản trị viên.' : message };

  return res.status(statusCode).json({
    success: false,
    ...responsePayload,
  });
};
