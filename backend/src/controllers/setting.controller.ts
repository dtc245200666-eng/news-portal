import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const getPublicSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return sendSuccess(res, settingsMap, 'Lấy cấu hình website thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy cấu hình website', 500);
  }
};

export const getAdminSettings = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });

    return sendSuccess(res, settings, 'Lấy danh sách cấu hình chi tiết thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách cấu hình', 500);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings } = req.body; // Array of { key, value, description } or object { key: value }

    if (Array.isArray(settings)) {
      for (const item of settings) {
        await prisma.siteSetting.upsert({
          where: { key: item.key },
          update: {
            value: String(item.value),
            ...(item.description && { description: item.description }),
          },
          create: {
            key: item.key,
            value: String(item.value),
            description: item.description || null,
          },
        });
      }
    } else if (typeof settings === 'object' && settings !== null) {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    await createAuditLog(req, 'UPDATE_SETTINGS', 'SYSTEM', 'settings', 'Cập nhật cấu hình website');

    return sendSuccess(res, null, 'Cập nhật cấu hình website thành công');
  } catch (error) {
    return sendError(res, 'Lỗi cập nhật cấu hình', 500);
  }
};
