import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có nội dung nào phù hợp với yêu cầu.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm my-6">
      <div className="w-16 h-16 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
