import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Bookmark,
  MessageSquare,
  Key,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Article, Comment } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner } from '../components/LoadingSpinner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự').max(100),
  avatar: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 chữ số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không trùng khớp',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'bookmarks' | 'comments'>('info');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 1. Profile edit form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
    },
  });

  // 2. Change password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // 3. Fetch bookmarks
  const { data: bookmarks = [], isLoading: loadingBookmarks } = useQuery<Article[]>({
    queryKey: ['myBookmarks'],
    queryFn: async () => {
      const res = await api.get('/users/me/bookmarks');
      return res.data.data;
    },
    enabled: activeTab === 'bookmarks',
  });

  // 4. Fetch own comments
  const { data: comments = [], isLoading: loadingComments } = useQuery<Comment[]>({
    queryKey: ['myComments'],
    queryFn: async () => {
      const res = await api.get('/users/me/comments');
      return res.data.data;
    },
    enabled: activeTab === 'comments',
  });

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      const res = await api.patch('/users/me', data);
      updateUser(res.data.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      setPasswordError('');
      await api.patch('/auth/change-password', data);
      setPasswordSuccess(true);
      resetPasswordForm();
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    }
  };

  const breadcrumbs = [{ label: 'Hồ sơ cá nhân độc giả' }];

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* User Header banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}`}
          alt={user?.fullName}
          className="w-20 h-20 rounded-full object-cover border-2 border-brand-700 shadow-sm"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-0.5 bg-brand-50 text-brand-800 text-xs font-bold rounded-full">
            Vai trò: {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'password'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Đổi mật khẩu</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'bookmarks'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bài viết đã lưu</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'comments'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Lịch sử bình luận</span>
        </button>
      </div>

      {/* Tab 1: Profile Info */}
      {activeTab === 'info' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cập nhật thông tin tài khoản</h2>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl flex items-center space-x-2 border border-green-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Cập nhật thông tin thành công!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                {...registerProfile('fullName')}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              {profileErrors.fullName && (
                <p className="text-xs text-red-600 mt-1">{profileErrors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Đường dẫn ảnh đại diện (URL)
              </label>
              <input
                type="text"
                {...registerProfile('avatar')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              {profileErrors.avatar && (
                <p className="text-xs text-red-600 mt-1">{profileErrors.avatar.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tiểu sử ngắn / Giới thiệu
              </label>
              <textarea
                {...registerProfile('bio')}
                rows={3}
                placeholder="Đôi lời giới thiệu về bản thân..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isProfileSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'password' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thay đổi mật khẩu đăng nhập</h2>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl flex items-center space-x-2 border border-green-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Đổi mật khẩu thành công!</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                {...registerPassword('currentPassword')}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                {...registerPassword('newPassword')}
                placeholder="Ít nhất 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                {...registerPassword('confirmPassword')}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isPasswordSubmitting ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div>
          {loadingBookmarks ? (
            <LoadingSpinner text="Đang tải danh sách bài viết đã lưu..." />
          ) : bookmarks.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
              <Bookmark className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">Bạn chưa lưu bài viết nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((art) => (
                <ArticleCard key={art.id} article={art} variant="standard" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Comments History */}
      {activeTab === 'comments' && (
        <div>
          {loadingComments ? (
            <LoadingSpinner text="Đang tải lịch sử bình luận..." />
          ) : comments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">Bạn chưa gửi bình luận nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  {comm.article && (
                    <p className="text-xs text-gray-400 mb-2">
                      Trên bài viết:{' '}
                      <a
                        href={`/bai-viet/${comm.article.slug}`}
                        className="font-bold text-brand-800 hover:underline"
                      >
                        {comm.article.title}
                      </a>
                    </p>
                  )}
                  <p className="text-sm text-gray-800">{comm.content}</p>
                  <span className="text-[11px] text-gray-400 mt-2 block">
                    {new Date(comm.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
