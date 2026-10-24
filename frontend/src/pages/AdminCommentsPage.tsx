import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Check, X, ShieldAlert, Trash2, Search } from 'lucide-react';
import { api } from '../services/api';
import { Comment, CommentStatus } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminCommentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: commentsData, isLoading } = useQuery<{
    comments: Comment[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['adminComments', page, statusFilter, search],
    queryFn: async () => {
      let q = `/admin/comments?page=${page}&limit=12`;
      if (statusFilter) q += `&status=${statusFilter}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(q);
      return {
        comments: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CommentStatus }) => {
      return api.patch(`/admin/comments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminComments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminComments'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Kiểm Duyệt Bình Luận</h1>
        <p className="text-xs text-gray-500 mt-1">
          Duyệt, ẩn nội dung vi phạm tiêu chuẩn cộng đồng hoặc xóa bình luận spam
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { label: 'Tất cả', value: '' },
            { label: 'Đã duyệt (APPROVED)', value: 'APPROVED' },
            { label: 'Chờ duyệt (PENDING)', value: 'PENDING' },
            { label: 'Vi phạm / Spam', value: 'SPAM' },
            { label: 'Đã từ chối', value: 'REJECTED' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === item.value
                  ? 'bg-brand-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm nội dung bình luận..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Comments List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Đang tải bình luận..." />
        ) : !commentsData?.comments || commentsData.comments.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Không tìm thấy bình luận nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Người gửi</th>
                  <th className="px-4 py-3">Nội dung bình luận</th>
                  <th className="px-4 py-3">Bài viết</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commentsData.comments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={c.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.fullName)}`}
                          alt={c.user.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-gray-900">{c.user.fullName}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-md">
                      <p className="text-gray-800 line-clamp-2 leading-relaxed">{c.content}</p>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      {c.article && (
                        <a
                          href={`/bai-viet/${c.article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-800 hover:underline line-clamp-1"
                        >
                          {c.article.title}
                        </a>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'SPAM'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1">
                      {c.status !== 'APPROVED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'APPROVED' })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Duyệt hiển thị"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {c.status !== 'SPAM' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'SPAM' })}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Đánh dấu Spam"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}

                      {c.status !== 'REJECTED' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'REJECTED' })}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                          title="Từ chối"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?')) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa bình luận"
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

        {commentsData?.totalPages && commentsData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={commentsData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
