import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const forgotSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ').toLowerCase(),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setErrorMessage('');
      const res = await api.post('/auth/forgot-password', data);
      setSubmitted(true);
      if (res.data?.data?.devToken) {
        setDevToken(res.data.data.devToken);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Khôi phục mật khẩu</h2>
        <p className="text-xs text-gray-500 mt-1">
          Nhập địa chỉ email tài khoản của bạn để nhận hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-green-900 mb-1">Yêu cầu đã được ghi nhận</h3>
            <p className="text-xs text-green-700 leading-relaxed">
              Nếu email có trong hệ thống, chúng tôi đã tạo mã đặt lại mật khẩu có hiệu lực trong vòng
              1 giờ.
            </p>
          </div>

          {devToken && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <p className="font-bold mb-1">Mã xác thực thử nghiệm (Development Mode):</p>
              <p className="font-mono break-all bg-white p-2 rounded border border-amber-300 text-[11px] mb-2">
                {devToken}
              </p>
              <Link
                to={`/dat-lai-mat-khau?token=${devToken}`}
                className="inline-block px-3 py-1.5 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800 transition"
              >
                Chuyển tới trang đổi mật khẩu ngay →
              </Link>
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/dang-nhap"
              className="text-xs font-semibold text-brand-800 hover:underline flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Địa chỉ Email đã đăng ký
            </label>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang kiểm tra...' : 'Gửi yêu cầu khôi phục'}</span>
          </button>

          <div className="text-center pt-2">
            <Link
              to="/dang-nhap"
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Quay lại Đăng nhập</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
