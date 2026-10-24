import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự').max(100),
  email: z.string().email('Địa chỉ email không hợp lệ').toLowerCase(),
  username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự').max(30).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Mật khẩu ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không trùng khớp',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage('');
      const payload = {
        ...data,
        username: data.username ? data.username : undefined,
      };
      const res = await api.post('/auth/register', payload);
      const { user, accessToken } = res.data.data;
      login(accessToken, user);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.'
      );
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Đăng ký tài khoản</h2>
        <p className="text-xs text-gray-500 mt-1">
          Trở thành độc giả chính thức để tham gia bình luận và nhận tin nóng
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên *</label>
          <div className="relative">
            <input
              type="text"
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ Email *</label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="email@example.com"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu *</label>
          <div className="relative">
            <input
              type="password"
              {...register('password')}
              placeholder="Ít nhất 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Xác nhận mật khẩu *
          </label>
          <div className="relative">
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="text-brand-800 font-bold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
