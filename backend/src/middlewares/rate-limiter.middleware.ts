import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đăng nhập/đăng ký từ địa chỉ này. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Bạn đang gửi bình luận quá nhanh. Vui lòng chờ 1 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
