import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Article } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>('newest');

  useEffect(() => {
    setInputQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  const { data, isLoading } = useQuery<{
    articles: Article[];
    total: number;
    totalPages: number;
    query: string;
  }>({
    queryKey: ['searchArticles', initialQuery, page, sort],
    queryFn: async () => {
      if (!initialQuery) return { articles: [], total: 0, totalPages: 0, query: '' };
      const res = await api.get(
        `/search?q=${encodeURIComponent(initialQuery)}&page=${page}&limit=9&sort=${sort}`
      );
      return {
        articles: res.data.data,
        total: res.data.meta?.total || 0,
        totalPages: res.data.meta?.totalPages || 1,
        query: initialQuery,
      };
    },
    enabled: true,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setSearchParams({ q: inputQuery.trim() });
  };

  const breadcrumbs = [{ label: 'Tìm kiếm tin tức' }];

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />

      {/* Search Input Box */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-wide">
          Tìm kiếm bài viết & tin tức
        </h1>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Nhập từ khóa cần tìm (tiêu đề, nội dung, chuyên mục, tác giả...)"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white transition"
            />
            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-sm shadow transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {initialQuery ? (
        <>
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Kết quả tìm kiếm cho:{' '}
              <span className="font-bold text-gray-900">"{initialQuery}"</span> ({data?.total || 0} bài viết)
            </p>

            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
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

          {isLoading ? (
            <LoadingSpinner text="Đang tìm kiếm bài viết..." />
          ) : data?.articles && data.articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="standard" />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy kết quả"
              description={`Không có bài viết nào phù hợp với từ khóa "${initialQuery}". Vui lòng thử từ khóa khác hoặc kiểm tra lại chính tả.`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <SearchIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm">Vui lòng nhập từ khóa để bắt đầu tìm kiếm thông tin.</p>
        </div>
      )}
    </div>
  );
};
