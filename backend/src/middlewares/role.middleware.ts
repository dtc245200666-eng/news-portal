import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Vui lòng đăng nhập để tiếp tục', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Bạn không có quyền thực hiện thao tác này', 403);
    }

    next();
  };
};

// Admin level access (SUPER_ADMIN or ADMIN)
export const requireAdmin = requireRoles(Role.SUPER_ADMIN, Role.ADMIN);

// Editorial level access (SUPER_ADMIN, ADMIN, EDITOR)
export const requireEditor = requireRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR);

// Staff level access (SUPER_ADMIN, ADMIN, EDITOR, AUTHOR)
export const requireStaff = requireRoles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.AUTHOR);
