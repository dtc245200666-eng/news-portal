import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, Calendar, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { Article } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { LikeBookmarkButtons } from '../components/LikeBookmarkButtons';
import { ShareButtons } from '../components/ShareButtons';
import { CommentSection } from '../components/CommentSection';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch article detail
  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await api.get(`/articles/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Fetch related articles
  const { data: related = [] } = useQuery<Article[]>({
    queryKey: ['relatedArticles', article?.id],
    queryFn: async () => {
      if (!article?.id) return [];
      const res = await api.get(`/articles/${article.id}/related`);
      return res.data.data;
    },
    enabled: !!article?.id,
  });

  // Increment view count on mount
  useEffect(() => {
    if (article?.id) {
      api.post(`/articles/${article.id}/view`).catch((err) => {
        console.warn('Could not record article view:', err);
      });
    }
  }, [article?.id]);

  if (isLoading) {
    return <LoadingSpinner text="Đang tải bài viết..." />;
  }

  if (isError || !article) {
    const errorMsg = (error as any)?.response?.data?.message || 'Bài viết không tồn tại hoặc chưa được phép xem';
    return (
      <EmptyState
        title="Không tìm thấy bài viết"
        description={errorMsg}
        actionText="Quay lại trang chủ"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const breadcrumbs = [
    { label: article.category.name, url: `/danh-muc/${article.category.slug}` },
    { label: article.title },
  ];

  return (
    <article className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* Category Tag & Reading Time */}
      <div className="flex items-center space-x-3 mb-4">
        <Link
          to={`/danh-muc/${article.category.slug}`}
          className="px-3 py-1 bg-brand-50 text-brand-800 text-xs font-bold uppercase rounded-md tracking-wider hover:bg-brand-100 transition"
        >
          {article.category.name}
        </Link>
        <span className="text-gray-300">•</span>
        <span className="flex items-center text-xs text-gray-500 font-medium">
          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
          {article.readingTime} phút đọc
        </span>
      </div>

      {/* Article Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 font-serif leading-tight mb-5">
        {article.title}
      </h1>

      {/* Author and Publishing metadata */}
      <div className="flex flex-wrap items-center justify-between py-4 border-y border-gray-200 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <img
            src={article.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.fullName)}`}
            alt={article.author.fullName}
            className="w-11 h-11 rounded-full object-cover border border-gray-200"
          />
          <div>
            <span className="font-bold text-sm text-gray-900 block">{article.author.fullName}</span>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {formatDate(article.publishedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            <Eye className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            {article.views.toLocaleString()} lượt xem
          </span>
        </div>
      </div>

      {/* Summary / Lead Paragraph */}
      <div className="text-lg md:text-xl font-semibold text-gray-700 leading-relaxed italic bg-gray-50 p-5 rounded-xl border-l-4 border-brand-800 mb-8">
        {article.summary}
      </div>

      {/* Main Cover Image */}
      {article.coverImage && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Article Body Content (Rich HTML Sanitized) */}
      <div
        className="article-content prose prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* Tags section */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200">
          <TagIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs font-bold text-gray-400 uppercase">Từ khóa:</span>
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/the/${tag.slug}`}
              className="px-3 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-800 text-gray-700 rounded-full text-xs font-medium transition"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Like and Bookmark action buttons */}
      <LikeBookmarkButtons
        articleId={article.id}
        initialLiked={article.isLiked}
        initialLikesCount={article.likesCount || 0}
        initialBookmarked={article.isBookmarked}
      />

      {/* Social share buttons */}
      <ShareButtons title={article.title} />

      {/* Author Bio Box */}
      {article.author.bio && (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 my-8 flex items-start space-x-4">
          <img
            src={article.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.fullName)}`}
            alt={article.author.fullName}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Về tác giả: {article.author.fullName}</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{article.author.bio}</p>
          </div>
        </div>
      )}

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="my-10 pt-8 border-t-2 border-brand-800">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-6">
            Tin liên quan cùng chuyên mục
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/bai-viet/${rel.slug}`}
                className="group flex space-x-3 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                {rel.coverImage && (
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-800 line-clamp-2 leading-snug transition">
                    {rel.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {formatDate(rel.publishedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments & Discussion */}
      <CommentSection articleId={article.id} />
    </article>
  );
};
