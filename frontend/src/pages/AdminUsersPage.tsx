import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Lock, Unlock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User, Role } from '../types';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: usersData, isLoading } = useQuery<{
    users: User[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['adminUsers', page, roleFilter, search],
    queryFn: async () => {
      let q = `/admin/users?page=${page}&limit=10`;
      if (roleFilter) q += `&role=${roleFilter}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(q);
      return {
        users: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/admin/users/${id}/toggle-lock`);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi thao tác khóa tài khoản.' });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: Role }) => {
      return api.patch(`/admin/users/${id}/role`, { role: newRole });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi phân quyền tài khoản.' });
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
        <h1 className="text-2xl font-black text-gray-900 font-serif">Quản Lý Tài Khoản Người Dùng</h1>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi danh sách người dùng, phân quyền vai trò và quản lý trạng thái khóa tài khoản
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Role filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { label: 'Tất cả', value: '' },
            { label: 'Super Admin', value: 'SUPER_ADMIN' },
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Biên tập viên', value: 'EDITOR' },
            { label: 'Phóng viên', value: 'AUTHOR' },
            { label: 'Độc giả', value: 'USER' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setRoleFilter(item.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === item.value
                  ? 'bg-brand-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Đang tải danh sách tài khoản..." />
        ) : !usersData?.users || usersData.users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Không tìm thấy tài khoản nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Bài viết</th>
                  <th className="px-4 py-3 text-center">Bình luận</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersData.users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 flex items-center space-x-3">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <span className="font-bold text-gray-900 block">{u.fullName}</span>
                        <span className="text-[11px] text-gray-400">{u.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          changeRoleMutation.mutate({ id: u.id, newRole: e.target.value as Role })
                        }
                        disabled={
                          currentUser?.id === u.id ||
                          (currentUser?.role !== 'SUPER_ADMIN' && u.role === 'SUPER_ADMIN')
                        }
                        className="p-1 text-xs font-bold border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:opacity-50"
                      >
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        )}
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="AUTHOR">AUTHOR</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold text-gray-600">
                      {u.articlesCount || 0}
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold text-gray-600">
                      {u.commentsCount || 0}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {currentUser?.id !== u.id && !(currentUser?.role !== 'SUPER_ADMIN' && u.role === 'SUPER_ADMIN') && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Bạn có chắc muốn ${u.isActive ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${u.email}?`
                              )
                            ) {
                              toggleLockMutation.mutate(u.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg border transition ${
                            u.isActive
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                          title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {u.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {usersData?.totalPages && usersData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={usersData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
