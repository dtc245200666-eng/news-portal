import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, LogOut, Shield, Bookmark, Newspaper, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Current formatted Vietnamese date
  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Top utility bar */}
      <div className="bg-gray-100 text-xs text-gray-600 border-b border-gray-200 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">{capitalizedDate}</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="hidden md:inline text-brand-800 font-semibold">
              Hotline: 1900 6868
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/lien-he" className="hover:text-brand-800 transition">
              Liên hệ tòa soạn
            </Link>
            <span className="text-gray-300">|</span>
            <a href="/rss.xml" target="_blank" rel="noreferrer" className="hover:text-brand-800 transition">
              RSS
            </a>
          </div>
        </div>
      </div>

      {/* Main branding and search bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Logo and site name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-800 rounded-xl flex items-center justify-center text-white shadow-md group-hover:bg-brand-900 transition">
            <Newspaper className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-brand-800 font-serif">
              NewsPortal
            </span>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Cổng thông tin điện tử
            </p>
          </div>
        </Link>

        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tin tức, sự kiện, tác giả..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-800 hover:bg-brand-900 text-white rounded-full text-xs font-semibold transition"
          >
            Tìm
          </button>
        </form>

        {/* User Account / Navigation */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden lg:inline text-sm font-semibold text-gray-800 max-w-[130px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Đăng nhập với</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-800 rounded">
                      {user.role}
                    </span>
                  </div>

                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50 transition"
                    >
                      <Shield className="w-4 h-4 text-brand-700" />
                      <span>Trang Quản Trị</span>
                    </Link>
                  )}

                  <Link
                    to="/tai-khoan"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  <Link
                    to="/tai-khoan/tin-da-luu"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Bookmark className="w-4 h-4 text-gray-400" />
                    <span>Bài viết đã lưu</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left border-t border-gray-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/dang-nhap"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-brand-800 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
