import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [parentId, setParentId] = useState<string>('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch flat categories list for admin
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing && editingId) {
        return api.patch(`/admin/categories/${editingId}`, payload);
      }
      return api.post('/admin/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
      setMessage({ type: 'success', text: isEditing ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục mới thành công!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setMessage({ type: 'success', text: 'Xóa danh mục thành công!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa danh mục này.' });
    },
  });

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setOrder(0);
    setParentId('');
  };

  const handleEditClick = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setOrder(cat.order || 0);
    setParentId(cat.parentId || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || null,
      order: Number(order) || 0,
      parentId: parentId || null,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Quản Lý Chuyên Mục Tin Tức</h1>
        <p className="text-xs text-gray-500 mt-1">
          Thiết lập cấu trúc cây danh mục chuyên đề, thứ tự hiển thị và đường dẫn thân thiện
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
        {/* Form Create / Edit (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
            {isEditing ? 'Chỉnh sửa chuyên mục' : 'Thêm chuyên mục mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tên chuyên mục *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Công nghệ"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Để trống sẽ tự sinh từ tên"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Chuyên mục cha (Cấp trên)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
              >
                <option value="">-- Danh mục gốc (Cấp 1) --</option>
                {categories
                  .filter((c) => !isEditing || c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mô tả tóm tắt</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Mô tả nội dung của chuyên mục..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white resize-y"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex-1 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
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

        {/* Categories Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingSpinner text="Đang tải danh mục..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Tên chuyên mục</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-3 py-3 text-center">Thứ tự</th>
                    <th className="px-4 py-3 text-center">Bài viết</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 font-bold text-gray-900 flex items-center space-x-2">
                          <FolderTree className="w-4 h-4 text-brand-700 flex-shrink-0" />
                          <span>{cat.name}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-500">{cat.slug}</td>
                        <td className="px-3 py-3.5 text-center text-gray-500">{cat.order}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-bold">
                            {cat.articleCount || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa chuyên mục "${cat.name}"?`)) {
                                deleteMutation.mutate(cat.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800 transition"
                            title="Xóa chuyên mục"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Child categories rows */}
                      {cat.children &&
                        cat.children.map((sub) => (
                          <tr key={sub.id} className="bg-gray-50/50 hover:bg-gray-100/60 transition">
                            <td className="px-5 py-2.5 pl-10 text-gray-800 flex items-center space-x-1">
                              <span className="text-gray-400">└─</span>
                              <span className="font-medium">{sub.name}</span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-gray-400 text-[11px]">{sub.slug}</td>
                            <td className="px-3 py-2.5 text-center text-gray-400 text-[11px]">{sub.order}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
                                {sub.articleCount || 0}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-right space-x-2">
                              <button
                                onClick={() => handleEditClick(sub)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Xóa chuyên mục con "${sub.name}"?`)) {
                                    deleteMutation.mutate(sub.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:text-red-800 transition"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
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
