import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Clock, User, Globe } from 'lucide-react';
import { api } from '../services/api';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface AuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { fullName: string; email: string; role: string } | null;
}

export const AdminAuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const { data: logsData, isLoading } = useQuery<{
    logs: AuditLogItem[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['adminAuditLogs', page, actionFilter],
    queryFn: async () => {
      let q = `/admin/audit-logs?page=${page}&limit=15`;
      if (actionFilter) q += `&action=${actionFilter}`;
      const res = await api.get(q);
      return {
        logs: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Nhật Ký Quản Trị Hệ Thống</h1>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi và truy vết tất cả các thao tác nhạy cảm trên hệ thống (bảo mật, xuất bản, phân quyền)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Đang tải nhật ký..." />
        ) : !logsData?.logs || logsData.logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">Chưa có nhật ký ghi nhận.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Loại hành động</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Chi tiết</th>
                  <th className="px-5 py-3">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {logsData.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap font-sans text-xs">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-sans text-xs">
                      <span className="font-bold text-gray-900 block">
                        {log.user?.fullName || 'Hệ thống'}
                      </span>
                      {log.user?.email && (
                        <span className="text-[10px] text-gray-400">{log.user.email}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-800 rounded font-bold font-mono">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-sans">
                      {log.targetType}
                    </td>

                    <td className="px-4 py-3 max-w-xs font-sans text-xs text-gray-800 truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap text-gray-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {logsData?.totalPages && logsData.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={logsData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
