import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 py-3 mb-4 overflow-x-auto">
      <Link to="/" className="flex items-center hover:text-brand-700 transition">
        <Home className="w-4 h-4 mr-1" />
        <span>Trang chủ</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {item.url ? (
            <Link to={item.url} className="hover:text-brand-700 whitespace-nowrap transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium whitespace-nowrap truncate max-w-xs md:max-w-md">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
