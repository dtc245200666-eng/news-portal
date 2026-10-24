import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Users,
  MessageSquare,
  Image,
  Globe,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/dang-nhap');
  };

  const navItems = [
    { label: 'Tổng quan Dashboard', path: '/admin', icon: LayoutDashboard, exact: true, show: true },
    { label: 'Quản lý Bài viết', path: '/admin/bai-viet', icon: FileText, show: true },
    { label: 'Quản lý Danh mục', path: '/admin/danh-muc', icon: FolderTree, show: isEditor },
    { label: 'Quản lý Thẻ Tag', path: '/admin/the', icon: Tags, show: isEditor },
    { label: 'Quản lý Bình luận', path: '/admin/binh-luan', icon: MessageSquare, show: isEditor },
    { label: 'Quản lý Media', path: '/admin/media', icon: Image, show: true },
    { label: 'Thư liên hệ độc giả', path: '/admin/lien-he', icon: Mail, show: isAdmin },
    { label: 'Quản lý Người dùng', path: '/admin/nguoi-dung', icon: Users, show: isAdmin },
    { label: 'Quản lý Trang tĩnh', path: '/admin/trang-tinh', icon: Globe, show: isAdmin },
    { label: 'Cài đặt Website', path: '/admin/cai-dat', icon: Settings, show: isAdmin },
    { label: 'Nhật ký quản trị', path: '/admin/nhat-ky', icon: ShieldAlert, show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center font-bold">
            NP
          </div>
          <span className="font-serif font-bold text-lg">Quản Trị Tin Tức</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col justify-between z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-brand-700 rounded-lg flex items-center justify-center text-white font-bold font-serif shadow">
                NP
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white tracking-wide block">
                  NewsPortal
                </span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/60">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}`}
              alt={user?.fullName}
              className="w-9 h-9 rounded-full object-cover border border-gray-700"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
              <span className="text-[10px] text-brand-400 font-medium block uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-semibold rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-1.5 bg-red-950/60 text-red-400 hover:bg-red-900 hover:text-white rounded-lg transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-3.5 items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-500">
            <span>Khu vực quản trị nội dung tòa soạn</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1.5 text-xs font-semibold text-brand-800 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Truy cập trang công khai</span>
            </Link>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <span className="text-xs font-semibold text-gray-700">{user?.fullName}</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
