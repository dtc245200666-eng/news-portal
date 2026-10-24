import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../config/prisma';
import { sendError } from '../utils/response';
import { User, Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return sendError(res, 'Yêu cầu xác thực. Vui lòng đăng nhập.', 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      return sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return sendError(res, 'Tài khoản không tồn tại', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Tài khoản của bạn đã bị khóa', 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    return sendError(res, 'Lỗi xác thực người dùng', 500);
  }
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Silently ignore invalid token for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};
