import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const resetSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không trùng khớp',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      setErrorMessage('Không tìm thấy mã token đặt lại mật khẩu trong liên kết.');
      return;
    }
    try {
      setErrorMessage('');
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'
      );
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Đặt lại mật khẩu</h2>
        <p className="text-xs text-gray-500 mt-1">Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn</p>
      </div>

      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h3 className="text-base font-bold text-green-900">Đặt lại mật khẩu thành công!</h3>
          <p className="text-xs text-green-700">
            Mật khẩu mới đã được lưu. Bây giờ bạn có thể đăng nhập bằng thông tin mới.
          </p>
          <Link
            to="/dang-nhap"
            className="inline-block px-5 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold shadow hover:bg-brand-900 transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!token && (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
              Cảnh báo: Không tìm thấy tham số token trên thanh địa chỉ URL. Vui lòng kiểm tra lại đường dẫn từ email.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
            <div className="relative">
              <input
                type="password"
                {...register('newPassword')}
                placeholder="Ít nhất 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-xl shadow transition disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Xác nhận đổi mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
};
