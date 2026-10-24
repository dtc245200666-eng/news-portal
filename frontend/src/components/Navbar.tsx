import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, X, ChevronDown, Search } from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSearch, setMobileSearch] = useState('');
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearch.trim()) return;
    setMobileMenuOpen(false);
    navigate(`/tim-kiem?q=${encodeURIComponent(mobileSearch.trim())}`);
  };

  return (
    <nav className="bg-brand-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Desktop category list */}
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto py-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-3 text-sm font-bold uppercase tracking-wider transition border-b-2 ${
                isActive
                  ? 'border-white bg-brand-900 text-white'
                  : 'border-transparent text-gray-100 hover:bg-brand-900 hover:text-white'
              }`
            }
          >
            Trang chủ
          </NavLink>

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative group"
              onMouseEnter={() => cat.children?.length && setActiveDropdown(cat.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavLink
                to={`/danh-muc/${cat.slug}`}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-white bg-brand-900 text-white'
                      : 'border-transparent text-gray-100 hover:bg-brand-900 hover:text-white'
                  }`
                }
              >
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-75" />
                )}
              </NavLink>

              {/* Subcategories dropdown */}
              {cat.children && cat.children.length > 0 && activeDropdown === cat.id && (
                <div className="absolute left-0 top-full w-52 bg-white text-gray-800 rounded-b-xl shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/danh-muc/${sub.slug}`}
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-800 transition"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="flex md:hidden items-center justify-between w-full py-2.5">
          <span className="text-sm font-bold tracking-wider uppercase text-white">Chuyên mục</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg text-white hover:bg-brand-900 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-900 border-t border-brand-700 px-4 py-4 space-y-3 animate-fadeIn">
          {/* Mobile search input */}
          <form onSubmit={handleMobileSearch} className="relative mb-4">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-9 pr-4 py-2 bg-brand-950 border border-brand-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold uppercase text-white hover:text-brand-200 border-b border-brand-800"
          >
            Trang chủ
          </Link>

          {categories.map((cat) => (
            <div key={cat.id} className="border-b border-brand-800 pb-2">
              <Link
                to={`/danh-muc/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm font-bold uppercase text-white hover:text-brand-200"
              >
                {cat.name}
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="pl-4 space-y-1 mt-1">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/danh-muc/${sub.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 text-xs text-brand-200 hover:text-white"
                    >
                      • {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 text-xs text-brand-300">
            <p>Hotline: 1900 6868</p>
            <p>Email: toasoan@newsportal.vn</p>
          </div>
        </div>
      )}
    </nav>
  );
};
