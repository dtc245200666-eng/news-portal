import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ✕
        </div>
        <h2 className="text-xl font-black text-gray-900 font-serif mb-2">Truy Cập Bị Từ Chối (403)</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Tài khoản của bạn với vai trò <span className="font-bold text-brand-700 font-mono">[{user.role}]</span> không có quyền truy cập vào phân hệ này.
        </p>
        <div className="flex justify-center space-x-3">
          {isStaff ? (
            <a
              href="/admin"
              className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition shadow"
            >
              Về bảng điều khiển Admin
            </a>
          ) : (
            <a
              href="/"
              className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition shadow"
            >
              Về trang chủ
            </a>
          )}
        </div>
      </div>
    );
  }

  return children;
};
