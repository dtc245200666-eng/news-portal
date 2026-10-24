import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag as TagIcon } from 'lucide-react';
import { api } from '../services/api';
import { Article, Tag } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const TagPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<number>(1);

  // Fetch Tag Info
  const { data: tag, isLoading: loadingTag } = useQuery<Tag>({
    queryKey: ['tag', slug],
    queryFn: async () => {
      const res = await api.get(`/tags/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Fetch articles by tag
  const { data: articlesData, isLoading: loadingArticles } = useQuery<{
    articles: Article[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['tagArticles', slug, page],
    queryFn: async () => {
      const res = await api.get(`/articles?tag=${slug}&page=${page}&limit=9`);
      return {
        articles: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
    enabled: !!slug,
  });

  if (loadingTag || loadingArticles) {
    return <LoadingSpinner text="Đang tải danh sách bài viết theo thẻ..." />;
  }

  if (!tag) {
    return (
      <EmptyState
        title="Thẻ không tồn tại"
        description="Thẻ tag này không có trên hệ thống."
        actionText="Quay lại trang chủ"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  const breadcrumbs = [{ label: `Thẻ: #${tag.name}` }];

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-8 flex items-center space-x-3">
        <div className="w-12 h-12 bg-brand-50 text-brand-800 rounded-xl flex items-center justify-center">
          <TagIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">
            Chủ đề: #{tag.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng {articlesData?.total || 0} bài viết liên quan
          </p>
        </div>
      </div>

      {articlesData?.articles && articlesData.articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesData.articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={articlesData.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      ) : (
        <EmptyState
          title="Chưa có bài viết"
          description={`Chưa có bài viết nào được gắn thẻ "#${tag.name}".`}
        />
      )}
    </div>
  );
};
