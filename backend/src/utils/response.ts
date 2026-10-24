import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Thành công',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string = 'Đã có lỗi xảy ra',
  statusCode: number = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
