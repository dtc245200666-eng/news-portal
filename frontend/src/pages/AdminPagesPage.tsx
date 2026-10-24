import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { StaticPage } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminPagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState<string>('gioi-thieu');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: pages = [], isLoading } = useQuery<StaticPage[]>({
    queryKey: ['adminPages'],
    queryFn: async () => {
      const res = await api.get('/pages');
      return res.data.data;
    },
  });

  const currentPage = pages.find((p) => p.slug === selectedSlug);

  React.useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      setContent(currentPage.content);
      setMetaTitle(currentPage.metaTitle || '');
      setMetaDesc(currentPage.metaDesc || '');
    }
  }, [currentPage, selectedSlug]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return api.patch(`/pages/${selectedSlug}`, {
        title,
        content,
        metaTitle,
        metaDesc,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPages'] });
      queryClient.invalidateQueries({ queryKey: ['staticPage', selectedSlug] });
      setSuccessMessage('Lưu nội dung trang thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách trang..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Quản Lý Trang Nội Dung Tĩnh</h1>
        <p className="text-xs text-gray-500 mt-1">
          Chỉnh sửa nội dung Giới thiệu, Liên hệ, Chính sách bảo mật và Điều khoản sử dụng
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pages selector tabs */}
      <div className="flex border-b border-gray-200 space-x-2 overflow-x-auto">
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSelectedSlug(p.slug)}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              selectedSlug === p.slug
                ? 'border-brand-800 text-brand-800 bg-brand-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Page Form Editor */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Tiêu đề trang
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 text-sm font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Nội dung bài viết (Hỗ trợ HTML)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full p-4 font-mono text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu trang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
