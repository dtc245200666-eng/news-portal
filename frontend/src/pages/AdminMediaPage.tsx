import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Upload, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface MediaItem {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploader: { fullName: string };
}

export const AdminMediaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: mediaData, isLoading } = useQuery<{
    media: MediaItem[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['adminMedia', page],
    queryFn: async () => {
      const res = await api.get(`/media?page=${page}&limit=12`);
      return {
        media: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMedia'] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setErrorMessage('');
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['adminMedia'] });
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Lỗi khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-serif">Thư Viện Media</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý tệp ảnh, sao chép đường dẫn trực tiếp để chèn vào bài viết
          </p>
        </div>

        <label className="flex items-center space-x-2 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh mới'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Grid of Media Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <LoadingSpinner text="Đang tải thư viện ảnh..." />
        ) : !mediaData?.media || mediaData.media.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Chưa có tệp tin nào trong thư viện media. Hãy tải lên ảnh đầu tiên!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaData.media.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex flex-col justify-between"
              >
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition"
                    title="Mở ảnh gốc"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-2.5">
                  <p className="text-[11px] font-bold text-gray-800 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatSize(item.size)} • {item.uploader?.fullName}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      className="flex items-center space-x-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900 transition"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600">Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa vĩnh viễn tệp ảnh "${item.originalName}"?`)) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {mediaData?.totalPages && mediaData.totalPages > 1 && (
          <div className="pt-6 border-t border-gray-100 mt-6">
            <Pagination
              currentPage={page}
              totalPages={mediaData.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
