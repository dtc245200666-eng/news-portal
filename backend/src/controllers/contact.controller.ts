import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { cleanText } from '../utils/sanitize';

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    const contact = await prisma.contactMessage.create({
      data: {
        fullName: cleanText(fullName),
        email: email.trim().toLowerCase(),
        phone: phone ? cleanText(phone) : null,
        subject: cleanText(subject),
        message: cleanText(message),
      },
    });

    return sendSuccess(res, { id: contact.id }, 'Gửi tin nhắn liên hệ thành công. Tòa soạn sẽ phản hồi sớm nhất.', 201);
  } catch (error) {
    return sendError(res, 'Lỗi gửi tin nhắn liên hệ', 500);
  }
};

export const getContactMessages = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, messages, 'Lấy danh sách thư liên hệ thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy tin nhắn liên hệ', 500);
  }
};

export const markContactRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return sendSuccess(res, updated, 'Đã đánh dấu đã đọc');
  } catch (error) {
    return sendError(res, 'Lỗi cập nhật trạng thái thư', 500);
  }
};
