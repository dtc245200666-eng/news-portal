import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { createAuditLog } from '../utils/audit';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, username, password } = req.body;

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return sendError(res, 'Email này đã được sử dụng. Vui lòng chọn email khác.', 409);
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return sendError(res, 'Tên đăng nhập này đã được sử dụng.', 409);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userUsername = username || `${email.split('@')[0]}_${Date.now().toString(36)}`;

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        username: userUsername,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    await createAuditLog(req, 'USER_REGISTER', 'USER', user.id, `Người dùng mới đăng ký: ${user.email}`);

    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      'Đăng ký tài khoản thành công',
      201
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return sendError(res, 'Lỗi hệ thống khi đăng ký tài khoản', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 'Thông tin đăng nhập hoặc mật khẩu không chính xác', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Thông tin đăng nhập hoặc mật khẩu không chính xác', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    await createAuditLog(req, 'USER_LOGIN', 'USER', user.id, `Đăng nhập thành công: ${user.email}`);

    return sendSuccess(
      res,
      { user: safeUser, accessToken, refreshToken },
      'Đăng nhập thành công'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 'Lỗi hệ thống khi đăng nhập', 500);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    clearAuthCookies(res);
    if (req.user) {
      await createAuditLog(req, 'USER_LOGOUT', 'USER', req.user.id, `Đăng xuất tài khoản: ${req.user.email}`);
    }
    return sendSuccess(res, null, 'Đăng xuất thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi đăng xuất', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy thông tin tài khoản', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent user enumeration, always return standard message
    if (!user) {
      return sendSuccess(
        res,
        null,
        'Nếu email tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.'
      );
    }

    // Generate random secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    await createAuditLog(req, 'FORGOT_PASSWORD_REQUEST', 'USER', user.id, `Yêu cầu quên mật khẩu: ${user.email}`);

    // In development mode, return token so developer can test easily without SMTP
    return sendSuccess(
      res,
      {
        message: 'Mã token khôi phục đã được tạo (hợp lệ trong 1 giờ).',
        devToken: rawToken, // Convenient for local testing
      },
      'Nếu email tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.'
    );
  } catch (error) {
    return sendError(res, 'Lỗi xử lý yêu cầu quên mật khẩu', 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt) {
      return sendError(res, 'Mã token khôi phục không hợp lệ hoặc đã hết hạn', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await createAuditLog(
      req,
      'RESET_PASSWORD_SUCCESS',
      'USER',
      resetRecord.userId,
      `Đặt lại mật khẩu thành công cho tài khoản: ${resetRecord.user.email}`
    );

    return sendSuccess(res, null, 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.');
  } catch (error) {
    return sendError(res, 'Lỗi khi đặt lại mật khẩu', 500);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Chưa đăng nhập', 401);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return sendError(res, 'Người dùng không tồn tại', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Mật khẩu hiện tại không chính xác', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await createAuditLog(req, 'CHANGE_PASSWORD', 'USER', user.id, 'Người dùng đổi mật khẩu thành công');

    return sendSuccess(res, null, 'Thay đổi mật khẩu thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi thay đổi mật khẩu', 500);
  }
};
