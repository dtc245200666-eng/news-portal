import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Image,
  Upload,
  CheckCircle,
  Eye,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Category, Tag, ArticleStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ArticleFormInputs {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  tagIds: string[];
  status: ArticleStatus;
  isFeatured: boolean;
  isEditorPick: boolean;
  metaTitle?: string;
  metaDesc?: string;
}

export const AdminArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id && id !== 'tao-moi';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormInputs>({
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      categoryId: '',
      tagIds: [],
      status: 'DRAFT',
      isFeatured: false,
      isEditorPick: false,
      metaTitle: '',
      metaDesc: '',
    },
  });

  const watchedContent = watch('content');
  const watchedCoverImage = watch('coverImage');
  const watchedTitle = watch('title');

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get('/tags');
      return res.data.data;
    },
  });

  // Fetch existing article if in edit mode
  const { isLoading: loadingArticle } = useQuery({
    queryKey: ['adminArticle', id],
    queryFn: async () => {
      const res = await api.get(`/admin/articles/${id}`);
      const art = res.data.data;
      reset({
        title: art.title,
        slug: art.slug,
        summary: art.summary,
        content: art.content,
        coverImage: art.coverImage || '',
        categoryId: art.categoryId,
        tagIds: art.tagIds || [],
        status: art.status,
        isFeatured: art.isFeatured,
        isEditorPick: art.isEditorPick,
        metaTitle: art.metaTitle || '',
        metaDesc: art.metaDesc || '',
      });
      return art;
    },
    enabled: isEditMode,
  });

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data.data.url;
      setValue('coverImage', uploadedUrl);
      setSuccessMessage('Tải ảnh đại diện lên thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ArticleFormInputs) => {
    try {
      setErrorMessage('');
      if (isEditMode) {
        await api.patch(`/admin/articles/${id}`, data);
      } else {
        await api.post('/admin/articles', data);
      }
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      navigate('/admin/bai-viet');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Lỗi khi lưu bài viết.');
    }
  };

  if (isEditMode && loadingArticle) {
    return <LoadingSpinner text="Đang tải dữ liệu bài viết..." />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/bai-viet"
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
              {isEditMode ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Cung cấp đầy đủ thông tin để bài viết đạt tiêu chuẩn xuất bản cao nhất
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'preview' ? 'content' : 'preview')}
            className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{activeTab === 'preview' ? 'Quay lại soạn thảo' : 'Xem trước'}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs for Editor vs SEO vs Preview */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'content'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Nội dung chính
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'seo'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Cấu hình SEO & Slug
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'preview'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Xem trước bài viết
        </button>
      </div>

      {/* Tab 1: Main Content */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Inputs (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tiêu đề bài viết *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Tiêu đề bài viết là bắt buộc' })}
                  placeholder="Nhập tiêu đề tin tức nổi bật..."
                  className="w-full p-3 text-base font-bold bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white"
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mô tả ngắn / Sapo (Tóm tắt) *
                </label>
                <textarea
                  {...register('summary', { required: 'Mô tả ngắn là bắt buộc' })}
                  rows={3}
                  placeholder="Đoạn văn ngắn gọn (2-3 câu) tóm tắt ý chính của bài viết..."
                  className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white resize-y font-medium text-gray-700"
                />
                {errors.summary && <p className="text-xs text-red-600 mt-1">{errors.summary.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nội dung chi tiết bài viết (Hỗ trợ định dạng HTML phong phú) *
                </label>
                <textarea
                  {...register('content', { required: 'Nội dung bài viết là bắt buộc' })}
                  rows={14}
                  placeholder="<p>Nhập nội dung bài viết ở đây, có thể chèn các thẻ <h2>, <h3>, <blockquote>, <p>, <ul>, <li>...</p>"
                  className="w-full p-4 font-mono text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white resize-y"
                />
                {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Categories, Image, Tags, Publishing (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publishing Settings Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                Trạng thái & Phân loại
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng thái xuất bản</label>
                <select
                  {...register('status')}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700"
                >
                  <option value="DRAFT">Bản nháp (DRAFT)</option>
                  <option value="PENDING">Chờ biên tập duyệt (PENDING)</option>
                  {user?.role !== 'AUTHOR' && (
                    <>
                      <option value="PUBLISHED">Xuất bản công khai (PUBLISHED)</option>
                      <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chuyên mục chính *</label>
                <select
                  {...register('categoryId', { required: 'Vui lòng chọn chuyên mục' })}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700"
                >
                  <option value="">-- Chọn chuyên mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Special Flags for Editor/Admin */}
              {user?.role !== 'AUTHOR' && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isFeatured')}
                      className="rounded text-brand-700 focus:ring-brand-700 h-4 w-4"
                    />
                    <span>Đặt làm tin nổi bật (Featured)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isEditorPick')}
                      className="rounded text-brand-700 focus:ring-brand-700 h-4 w-4"
                    />
                    <span>Đề xuất bởi Tòa soạn (Editor's Pick)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Cover Image Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center">
                <Image className="w-3.5 h-3.5 mr-1 text-brand-700" />
                Ảnh bìa bài viết
              </h3>

              {watchedCoverImage && (
                <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={watchedCoverImage}
                    alt="Preview cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL ảnh trực tiếp
                </label>
                <input
                  type="text"
                  {...register('coverImage')}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-700"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hoặc tải tệp ảnh từ máy
                </label>
                <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-xs text-gray-600 transition">
                  <Upload className="w-4 h-4 text-brand-700" />
                  <span>{uploadingImage ? 'Đang tải tệp lên...' : 'Chọn ảnh để upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            {/* Tags Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                Thẻ từ khóa (Tags)
              </h3>
              <p className="text-[11px] text-gray-400">Chọn các thẻ tag liên quan đến bài viết:</p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-200 transition"
                  >
                    <input
                      type="checkbox"
                      value={tag.id}
                      {...register('tagIds')}
                      className="rounded text-brand-700 focus:ring-brand-700 h-3.5 w-3.5"
                    />
                    <span>#{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-base font-bold text-gray-900 mb-2">Tối ưu hóa công cụ tìm kiếm (SEO)</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Đường dẫn URL thân thiện (Slug)
            </label>
            <input
              type="text"
              {...register('slug')}
              placeholder="Để trống hệ thống sẽ tự động tạo từ tiêu đề"
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
            <p className="text-[11px] text-gray-400 mt-1">Ví dụ: viet-nam-phat-trien-cong-nghiep-ai</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Thẻ Meta Title</label>
            <input
              type="text"
              {...register('metaTitle')}
              placeholder="Tiêu đề hiển thị trên Google (Mặc định dùng tiêu đề bài viết)"
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Thẻ Meta Description
            </label>
            <textarea
              {...register('metaDesc')}
              rows={3}
              placeholder="Mô tả tóm tắt hiển thị trên kết quả tìm kiếm..."
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 resize-y"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Live Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
          <div className="mb-4">
            <span className="text-xs font-bold text-brand-700 uppercase bg-brand-50 px-3 py-1 rounded">
              Xem trước bài viết
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 font-serif leading-tight mb-4">
            {watchedTitle || 'Tiêu đề bài viết sẽ hiển thị ở đây'}
          </h1>
          {watchedCoverImage && (
            <img
              src={watchedCoverImage}
              alt="Preview"
              className="w-full max-h-[400px] object-cover rounded-xl my-6"
            />
          )}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: watchedContent || '<p>Chưa có nội dung để xem trước...</p>' }}
          />
        </div>
      )}
    </form>
  );
};
