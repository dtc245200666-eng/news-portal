import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, Sparkles, ChevronRight, Newspaper } from 'lucide-react';
import { api } from '../services/api';
import { Article, Category } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HomePage: React.FC = () => {
  // 1. Featured articles
  const { data: featured = [], isLoading: loadingFeatured } = useQuery<Article[]>({
    queryKey: ['featuredArticles'],
    queryFn: async () => {
      const res = await api.get('/articles/featured');
      return res.data.data;
    },
  });

  // 2. Latest articles
  const { data: latest = [], isLoading: loadingLatest } = useQuery<Article[]>({
    queryKey: ['latestArticles'],
    queryFn: async () => {
      const res = await api.get('/articles/latest?limit=8');
      return res.data.data;
    },
  });

  // 3. Most viewed articles
  const { data: mostViewed = [], isLoading: loadingMostViewed } = useQuery<Article[]>({
    queryKey: ['mostViewedArticles'],
    queryFn: async () => {
      const res = await api.get('/articles/most-viewed?limit=5');
      return res.data.data;
    },
  });

  // 4. Editor's picks
  const { data: editorPicks = [] } = useQuery<Article[]>({
    queryKey: ['editorPicks'],
    queryFn: async () => {
      const res = await api.get('/articles/editor-picks');
      return res.data.data;
    },
  });

  // 5. Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
  });

  if (loadingFeatured && loadingLatest) {
    return <LoadingSpinner text="Đang tải trang chủ NewsPortal..." />;
  }

  const heroArticle = featured[0];
  const secondaryFeatured = featured.slice(1, 4);

  return (
    <div className="space-y-12">
      {/* 1. Breaking & Featured Hero Section */}
      <section>
        <div className="flex items-center space-x-2 pb-3 mb-6 border-b-2 border-brand-800">
          <Flame className="w-5 h-5 text-brand-700 animate-pulse" />
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
            Tiêu điểm nổi bật
          </h2>
        </div>

        {heroArticle ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Featured Big Card */}
            <div className="lg:col-span-8">
              <ArticleCard article={heroArticle} variant="hero" />
            </div>

            {/* Side secondary featured cards */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {secondaryFeatured.map((art) => (
                <ArticleCard key={art.id} article={art} variant="horizontal" />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Chưa có bài viết nổi bật.</p>
        )}
      </section>

      {/* 2. Main Body: Latest News (Left) + Most Viewed Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest News (8 columns) */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-brand-800">
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-brand-700" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                Tin tức mới nhất
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </section>

        {/* Most Viewed Sidebar (4 columns) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Most Viewed Box */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 mb-4 border-b-2 border-brand-800">
              <TrendingUp className="w-5 h-5 text-brand-700" />
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                Xem nhiều nhất
              </h3>
            </div>

            <div className="space-y-1">
              {mostViewed.map((art, idx) => (
                <ArticleCard key={art.id} article={art} variant="minimal" index={idx} />
              ))}
            </div>
          </div>

          {/* Editor's Choice Box */}
          {editorPicks.length > 0 && (
            <div className="bg-gradient-to-br from-brand-900 to-gray-950 text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-brand-700/60">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Tòa soạn đề xuất
                </h3>
              </div>

              <div className="space-y-4">
                {editorPicks.slice(0, 3).map((art) => (
                  <div key={art.id} className="group border-b border-gray-800 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      {art.category.name}
                    </span>
                    <Link to={`/bai-viet/${art.slug}`}>
                      <h4 className="font-bold text-sm text-gray-100 group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 3. Category Blocks (Thời sự, Kinh doanh, Công nghệ, Thể thao) */}
      <div className="space-y-10 pt-4">
        {categories.slice(0, 4).map((cat) => (
          <section key={cat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-brand-800">
              <Link to={`/danh-muc/${cat.slug}`} className="group flex items-center space-x-2">
                <h2 className="text-xl font-black text-gray-900 group-hover:text-brand-800 uppercase tracking-wide transition">
                  {cat.name}
                </h2>
                <ChevronRight className="w-4 h-4 text-brand-700 group-hover:translate-x-1 transition" />
              </Link>

              {/* Subcategories pills */}
              {cat.children && cat.children.length > 0 && (
                <div className="hidden sm:flex items-center space-x-3 text-xs font-semibold text-gray-500">
                  {cat.children.slice(0, 3).map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/danh-muc/${sub.slug}`}
                      className="hover:text-brand-800 transition"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <CategoryArticlesGrid categorySlug={cat.slug} />
          </section>
        ))}
      </div>
    </div>
  );
};

// Helper component to query articles for category block on Homepage
const CategoryArticlesGrid: React.FC<{ categorySlug: string }> = ({ categorySlug }) => {
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['categoryBlockArticles', categorySlug],
    queryFn: async () => {
      const res = await api.get(`/articles?category=${categorySlug}&limit=4`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-6 text-gray-400 text-xs">Đang tải tin tức...</div>;
  }

  if (articles.length === 0) {
    return <p className="text-gray-400 text-xs italic">Chưa có bài viết trong chuyên mục này.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {articles.map((art) => (
        <ArticleCard key={art.id} article={art} variant="standard" />
      ))}
    </div>
  );
};
