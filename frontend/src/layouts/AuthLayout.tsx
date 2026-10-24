import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group mb-4">
          <div className="w-12 h-12 bg-brand-800 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:bg-brand-900 transition">
            <Newspaper className="w-7 h-7" />
          </div>
          <span className="text-3xl font-black font-serif text-brand-800 tracking-tight">
            NewsPortal
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
