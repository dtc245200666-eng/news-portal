import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const { data: rawSettings = [], isLoading } = useQuery<Array<{ key: string; value: string; description?: string }>>({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (rawSettings.length > 0) {
      const map: Record<string, string> = {};
      rawSettings.forEach((item) => {
        map[item.key] = item.value;
      });
      setSettings(map);
    }
  }, [rawSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.patch('/settings', { settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      setSuccessMessage('Lưu cài đặt hệ thống thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải cấu hình..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-serif">Cài Đặt Hệ Thống</h1>
        <p className="text-xs text-gray-500 mt-1">
          Cấu hình tên hiển thị, thông tin liên hệ tòa soạn, số hotline và mạng xã hội
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tên website (Site Name)
            </label>
            <input
              type="text"
              value={settings['site_name'] || ''}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Khẩu hiệu / Slogan
            </label>
            <input
              type="text"
              value={settings['site_slogan'] || ''}
              onChange={(e) => handleChange('site_slogan', e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mô tả mặc định (SEO Meta Description)
          </label>
          <textarea
            value={settings['site_description'] || ''}
            onChange={(e) => handleChange('site_description', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email liên hệ tòa soạn
            </label>
            <input
              type="email"
              value={settings['contact_email'] || ''}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Hotline hỗ trợ (Đường dây nóng)
            </label>
            <input
              type="text"
              value={settings['hotline'] || ''}
              onChange={(e) => handleChange('hotline', e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Địa chỉ trụ sở chính
          </label>
          <input
            type="text"
            value={settings['address'] || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook URL</label>
            <input
              type="text"
              value={settings['facebook_url'] || ''}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">YouTube URL</label>
            <input
              type="text"
              value={settings['youtube_url'] || ''}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">TikTok URL</label>
            <input
              type="text"
              value={settings['tiktok_url'] || ''}
              onChange={(e) => handleChange('tiktok_url', e.target.value)}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saveMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
