import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Đang tải dữ liệu...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-gray-500 ${className}`}>
      <Loader2 className="w-10 h-10 animate-spin text-brand-700 mb-3" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};
