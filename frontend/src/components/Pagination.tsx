import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100 transition"
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="dots-start" className="w-9 h-9 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
            currentPage === i
              ? 'bg-brand-700 text-white font-bold'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="dots-end" className="w-9 h-9 flex items-center justify-center text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100 transition"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1.5 my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span>Trước</span>
      </button>

      {renderPages()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <span>Sau</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};
