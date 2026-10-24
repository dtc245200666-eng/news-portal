import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tags, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Tag } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminTagsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['adminTags'],
    queryFn: async () => {
      const res = await api.get('/tags');
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { name: string; slug?: string }) => {
      if (isEditing && editingId) {
        return api.patch(`/admin/tags/${editingId}`, payload);
      }
      return api.post('/admin/tags', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      resetForm();
      setMessage({ type: 'success', text: isEditing ? 'Cập nhật thẻ thành công!' : 'Tạo thẻ tag mới thành công!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu thẻ tag.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setMessage({ type: 'success', text: 'Xóa thẻ tag thành công!' });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setSlug('');
  };

  const handleEditClick = (t: Tag) => {
    setIsEditing(true);
    setEditingId(t.id);
    setName(t.name);
    setSlug(t.slug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({
      name: name.trim(),
      slug: slug.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Quản Lý Thẻ Từ Khóa (Tags)</h1>
        <p className="text-xs text-gray-500 mt-1">
          Gắn thẻ từ khóa chủ đề giúp bài viết dễ dàng được tìm kiếm và phân loại
        </p>
      </div>

      {message && (
        <div
          className={`p-3 text-xs rounded-xl flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form create/edit (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
            {isEditing ? 'Chỉnh sửa thẻ tag' : 'Thêm thẻ mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên thẻ tag *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Trí tuệ nhân tạo"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Để trống sẽ tự sinh từ tên"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm thẻ'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tags Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner text="Đang tải thẻ tag..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Tên thẻ</th>
                    <th className="px-4 py-3">Đường dẫn slug</th>
                    <th className="px-4 py-3 text-center">Số bài viết</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-bold text-gray-900 flex items-center space-x-1.5">
                        <Tags className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                        <span>#{tag.name}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-500">{tag.slug}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-bold">
                          {tag.articleCount || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(tag)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa thẻ "#${tag.name}"?`)) {
                              deleteMutation.mutate(tag.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
