import prisma from '../config/prisma';
import { Request } from 'express';

export async function createAuditLog(
  req: Request,
  action: string,
  targetType: string,
  targetId?: string,
  details?: string
) {
  try {
    const userId = (req as any).user?.id || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId: targetId ? String(targetId) : null,
        details: details || null,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
