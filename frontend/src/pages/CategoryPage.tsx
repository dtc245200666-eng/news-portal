import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Article, Category } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>('newest');

  // Fetch category info
  const { data: category, isLoading: loadingCategory } = useQuery<Category>({
    queryKey: ['category', slug],
    queryFn: async () => {
      const res = await api.get(`/categories/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // Fetch category articles
  const { data: articlesData, isLoading: loadingArticles } = useQuery<{
    articles: Article[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['categoryArticles', slug, page, sort],
    queryFn: async () => {
      const res = await api.get(`/articles?category=${slug}&page=${page}&limit=9&sort=${sort}`);
      return {
        articles: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
      };
    },
    enabled: !!slug,
  });

  if (loadingCategory || loadingArticles) {
    return <LoadingSpinner text="Đang tải chuyên mục..." />;
  }

  if (!category) {
    return (
      <EmptyState
        title="Không tìm thấy chuyên mục"
        description="Chuyên mục bạn đang tìm kiếm không tồn tại hoặc đã được chuyển hướng."
        actionText="Quay lại trang chủ"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  const breadcrumbs = [
    ...(category.parent ? [{ label: category.parent.name, url: `/danh-muc/${category.parent.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />

      {/* Category Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase tracking-wide border-l-4 border-brand-800 pl-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 text-sm md:text-base pl-5 max-w-3xl">
            {category.description}
          </p>
        )}

        {/* Subcategories pills */}
        {category.children && category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100 pl-5">
            <span className="text-xs font-bold text-gray-400 uppercase py-1">Chuyên mục con:</span>
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                to={`/danh-muc/${sub.slug}`}
                className="px-3 py-1 bg-gray-100 hover:bg-brand-50 hover:text-brand-800 text-gray-700 rounded-full text-xs font-semibold transition"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <p className="text-xs text-gray-500 font-medium">
          Tìm thấy <span className="font-bold text-gray-800">{articlesData?.total || 0}</span> bài viết
        </p>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Sắp xếp:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          >
            <option value="newest">Mới nhất</option>
            <option value="popular">Xem nhiều nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
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
          description={`Chưa có bài viết nào được xuất bản trong chuyên mục "${category.name}".`}
        />
      )}
    </div>
  );
};
