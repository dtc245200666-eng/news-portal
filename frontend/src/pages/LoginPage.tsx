import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage('');
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      login(accessToken, user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'
      );
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Đăng nhập tài khoản</h2>
        <p className="text-xs text-gray-500 mt-1">
          Truy cập hệ thống NewsPortal để đọc báo, bình luận và lưu trữ bài viết
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="tenban@example.com"
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700">Mật khẩu</label>
            <Link
              to="/quen-mat-khau"
              className="text-xs text-brand-700 hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-600">
        Chưa có tài khoản độc giả?{' '}
        <Link to="/dang-ky" className="text-brand-800 font-bold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};
