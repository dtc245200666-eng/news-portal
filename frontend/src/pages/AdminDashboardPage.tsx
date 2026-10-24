import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  FileEdit,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, isEditor } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
  });

  if (isLoading || !stats) {
    return <LoadingSpinner text="Đang tải dữ liệu bảng điều khiển..." />;
  }

  const statCards = [
    {
      label: user?.role === 'AUTHOR' ? 'Bài viết của tôi' : 'Tổng số bài viết',
      value: stats.totalArticles,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/bai-viet',
      show: true,
    },
    {
      label: 'Đã xuất bản',
      value: stats.publishedArticles,
      icon: CheckCircle,
      color: 'bg-green-600',
      link: '/admin/bai-viet?status=PUBLISHED',
      show: true,
    },
    {
      label: 'Bài viết chờ duyệt',
      value: stats.pendingArticles,
      icon: Clock,
      color: 'bg-amber-500',
      link: '/admin/bai-viet?status=PENDING',
      show: true,
    },
    {
      label: 'Bản nháp',
      value: stats.draftArticles,
      icon: FileEdit,
      color: 'bg-gray-500',
      link: '/admin/bai-viet?status=DRAFT',
      show: true,
    },
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-600',
      link: '/admin/nguoi-dung',
      show: isAdmin,
    },
    {
      label: 'Tổng bình luận',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'bg-indigo-600',
      link: '/admin/binh-luan',
      show: isEditor,
    },
    {
      label: user?.role === 'AUTHOR' ? 'Lượt xem bài viết' : 'Lượt xem tích lũy',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-brand-700',
      show: true,
    },
  ].filter((c) => c.show);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-serif">Bảng Điều Khiển Hệ Thống</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng hợp dữ liệu thời gian thực của Cổng thông tin điện tử NewsPortal
          </p>
        </div>

        <Link
          to="/admin/bai-viet/tao-moi"
          className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <span>+ Viết bài mới</span>
        </Link>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-gray-900">{card.value}</span>
              {card.link && (
                <Link to={card.link} className="text-xs text-brand-700 font-semibold hover:underline flex items-center">
                  <span>Chi tiết</span>
                  <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Views Trend Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-6 border-b border-gray-100">
          <TrendingUp className="w-5 h-5 text-brand-700" />
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
            Biểu đồ xu hướng lượt xem trong tuần
          </h2>
        </div>

        <div className="h-56 flex items-end justify-between space-x-3 pt-6 px-4">
          {stats.chartData.map((item, index) => {
            const heightPercent = Math.max(15, Math.round((item.views / 8500) * 100));
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="text-[11px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition mb-1.5">
                  {item.views.toLocaleString()}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-brand-700 rounded-t-lg group-hover:bg-brand-800 transition duration-300 shadow-sm"
                />
                <span className="text-xs font-semibold text-gray-600 mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Articles & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Bài viết mới nhất
            </h3>
            <Link to="/admin/bai-viet" className="text-xs text-brand-700 hover:underline font-semibold">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentArticles.map((art) => (
              <div key={art.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-gray-50">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-bold text-brand-700 uppercase">
                    {art.category.name}
                  </span>
                  <Link
                    to={`/admin/bai-viet/${art.id}`}
                    className="font-bold text-sm text-gray-900 hover:text-brand-800 line-clamp-1 block"
                  >
                    {art.title}
                  </Link>
                  <span className="text-[11px] text-gray-400">Tác giả: {art.author.fullName}</span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      art.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : art.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {art.status}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1">{art.views} lượt xem</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center">
              <Shield className="w-4 h-4 text-brand-700 mr-1.5" />
              Nhật ký thao tác gần đây
            </h3>
            {isAdmin && (
              <Link to="/admin/nhat-ky" className="text-xs text-brand-700 hover:underline font-semibold">
                Tất cả
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {stats.recentLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-xl text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800">{log.user?.fullName || 'Hệ thống'}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <p className="text-gray-600 line-clamp-1">{log.details || log.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
