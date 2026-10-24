import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';

const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự').max(100),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự').max(200),
  message: z.string().min(10, 'Nội dung ít nhất 10 ký tự').max(2000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setErrorMessage('');
      await api.post('/contact', data);
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const breadcrumbs = [{ label: 'Liên hệ tòa soạn' }];

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left info column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-brand-900 to-gray-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mb-4">
                Liên hệ Tòa soạn
              </h1>
              <p className="text-sm text-gray-300 leading-relaxed mb-8">
                NewsPortal luôn lắng nghe và tiếp nhận ý kiến đóng góp, tin bài cộng tác hoặc phản hồi
                về chất lượng tin tức từ quý độc giả trên mọi miền đất nước.
              </p>

              <div className="space-y-6 text-sm">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Trụ sở chính:</span>
                    <span className="text-gray-300">
                      Số 15 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Đường dây nóng 24/7:</span>
                    <span className="text-gray-300 font-semibold">1900 6868 - 028 3822 9999</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Thư điện tử:</span>
                    <span className="text-gray-300">toasoan@newsportal.vn</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-400">
              Mọi thư từ, bài cộng tác xin gửi kèm số điện thoại để tòa soạn tiện liên hệ lại.
            </div>
          </div>

          {/* Right form column */}
          <div className="lg:col-span-7 p-8 sm:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Gửi tin nhắn trực tiếp</h2>

            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center my-6">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-900 mb-1">Gửi liên hệ thành công!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Cảm ơn bạn đã gửi phản hồi. Tòa soạn NewsPortal sẽ tiếp nhận và phản hồi tới bạn qua
                  email sớm nhất có thể.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 transition"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="email@example.com"
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      placeholder="0912 345 678"
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tiêu đề liên hệ *
                    </label>
                    <input
                      type="text"
                      {...register('subject')}
                      placeholder="Vấn đề cần đóng góp, phản ánh..."
                      className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Vui lòng mô tả chi tiết nội dung bạn muốn gửi tới tòa soạn..."
                    className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white resize-y"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang gửi tin...' : 'Gửi thông điệp'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
