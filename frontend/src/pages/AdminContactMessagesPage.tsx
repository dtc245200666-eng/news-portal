import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Check, Eye } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const AdminContactMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['adminContactMessages'],
    queryFn: async () => {
      const res = await api.get('/contact');
      return res.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/contact/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContactMessages'] });
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Đang tải thư liên hệ..." />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Hộp Thư Độc Giả Liên Hệ</h1>
        <p className="text-xs text-gray-500 mt-1">
          Tiếp nhận và quản lý tin nhắn, ý kiến đóng góp gửi qua biểu mẫu liên hệ
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Hộp thư hiện chưa có tin nhắn nào.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 transition flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  msg.isRead ? 'bg-white hover:bg-gray-50' : 'bg-brand-50/30 hover:bg-brand-50/50'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{msg.fullName}</span>
                    <span className="text-xs text-gray-400">• {msg.email}</span>
                    {msg.phone && <span className="text-xs text-gray-400">• {msg.phone}</span>}
                    {!msg.isRead && (
                      <span className="px-2 py-0.5 bg-brand-700 text-white rounded text-[10px] font-bold">
                        Mới
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">{msg.subject}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {msg.message}
                  </p>
                  <span className="text-[11px] text-gray-400 block">
                    Gửi lúc: {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {!msg.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(msg.id)}
                    className="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>Đánh dấu đã đọc</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
