import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  Eye,
  Archive,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { Article, Category, ArticleStatus } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export const AdminArticlesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Fetch articles
  const { data: articlesData, isLoading } = useQuery<{
    articles: Article[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['adminArticles', page, status, search],
    queryFn: async () => {
      let query = `/admin/articles?page=${page}&limit=10`;
      if (status) query += `&status=${status}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(query);
      return {
        articles: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  // Quick status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: ArticleStatus }) => {
      await api.patch(`/admin/articles/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-serif">Quản Lý Bài Viết</h1>
          <p className="text-xs text-gray-500 mt-1">
            Soạn thảo, phê duyệt, lên lịch và quản lý trạng thái xuất bản
          </p>
        </div>

        <Link
          to="/admin/bai-viet/tao-moi"
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo bài viết mới</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { label: 'Tất cả', value: '' },
            { label: 'Đã xuất bản', value: 'PUBLISHED' },
            { label: 'Chờ duyệt', value: 'PENDING' },
            { label: 'Bản nháp', value: 'DRAFT' },
            { label: 'Lưu trữ', value: 'ARCHIVED' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setStatus(item.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                status === item.value
                  ? 'bg-brand-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề bài viết..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Đang tải danh sách bài viết..." />
        ) : !articlesData?.articles || articlesData.articles.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Bài viết</th>
                  <th className="px-4 py-3">Chuyên mục</th>
                  <th className="px-4 py-3">Tác giả</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Lượt xem</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articlesData.articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 max-w-sm">
                      <Link
                        to={`/admin/bai-viet/${art.id}`}
                        className="font-bold text-gray-900 hover:text-brand-800 line-clamp-2 leading-snug"
                      >
                        {art.title}
                      </Link>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Ngày tạo: {new Date(art.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                        {art.category.name}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {art.author.fullName}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          art.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : art.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : art.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {art.views.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      {/* View public */}
                      {art.status === 'PUBLISHED' && (
                        <a
                          href={`/bai-viet/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-500 hover:text-brand-800 inline-block transition"
                          title="Xem trên web"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}

                      {/* Quick Publish / Unpublish if Editor/Admin */}
                      {['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user?.role || '') && (
                        art.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => statusMutation.mutate({ id: art.id, newStatus: 'DRAFT' })}
                            className="p-1.5 text-amber-600 hover:text-amber-800 transition"
                            title="Gỡ xuất bản (Chuyển sang bản nháp)"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => statusMutation.mutate({ id: art.id, newStatus: 'PUBLISHED' })}
                            className="p-1.5 text-green-600 hover:text-green-800 transition"
                            title="Xuất bản ngay"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )
                      )}

                      {/* Edit */}
                      <Link
                        to={`/admin/bai-viet/${art.id}`}
                        className="p-1.5 text-blue-600 hover:text-blue-800 inline-block transition"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {/* Delete */}
                      {user?.role === 'AUTHOR' && art.status === 'PUBLISHED' ? (
                        <span
                          className="p-1.5 text-gray-300 inline-block cursor-not-allowed"
                          title="Bài viết đã xuất bản chỉ có thể gỡ hoặc xóa bởi ban biên tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}"?`)) {
                              deleteMutation.mutate(art.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 transition"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {articlesData?.totalPages && articlesData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={articlesData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
