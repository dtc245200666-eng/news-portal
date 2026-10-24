import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-8xl font-black text-brand-800 font-serif mb-2">404</span>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-gray-500 max-w-md mb-8 text-sm">
        Đường dẫn bạn vừa truy cập có thể đã bị xóa, thay đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center space-x-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-sm font-semibold rounded-xl shadow transition"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};
