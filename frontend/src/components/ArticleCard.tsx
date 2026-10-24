import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, MessageSquare, Heart } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'standard' | 'horizontal' | 'minimal';
  index?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  index,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const defaultImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';

  if (variant === 'hero') {
    return (
      <div className="group relative overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100 flex flex-col md:flex-row transition duration-300 hover:shadow-xl">
        <div className="md:w-3/5 overflow-hidden relative aspect-video md:aspect-auto">
          <img
            src={article.coverImage || defaultImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105 min-h-[260px] md:min-h-[360px]"
          />
          <Link
            to={`/danh-muc/${article.category.slug}`}
            className="absolute top-4 left-4 px-3 py-1 bg-brand-700 text-white text-xs font-bold uppercase rounded shadow hover:bg-brand-800 transition"
          >
            {article.category.name}
          </Link>
        </div>
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
              <span>{formatDate(article.publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {article.readingTime} phút đọc
              </span>
            </div>
            <Link to={`/bai-viet/${article.slug}`}>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-brand-700 transition leading-snug line-clamp-3 mb-3">
                {article.title}
              </h2>
            </Link>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
              {article.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <img
                src={article.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.fullName)}`}
                alt={article.author.fullName}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-medium text-gray-800 truncate max-w-[120px]">
                {article.author.fullName}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center" title="Lượt xem">
                <Eye className="w-3.5 h-3.5 mr-1" />
                {article.views.toLocaleString()}
              </span>
              {article.commentsCount !== undefined && (
                <span className="flex items-center" title="Bình luận">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  {article.commentsCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="group flex space-x-4 p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition">
        <Link
          to={`/bai-viet/${article.slug}`}
          className="w-32 h-24 sm:w-44 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg relative"
        >
          <img
            src={article.coverImage || defaultImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </Link>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center space-x-2 text-xs mb-1">
              <Link
                to={`/danh-muc/${article.category.slug}`}
                className="text-brand-700 font-semibold hover:underline"
              >
                {article.category.name}
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400">{formatDate(article.publishedAt)}</span>
            </div>
            <Link to={`/bai-viet/${article.slug}`}>
              <h3 className="font-bold text-gray-900 group-hover:text-brand-700 text-sm sm:text-base line-clamp-2 leading-snug transition">
                {article.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400 mt-2">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {article.views.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {article.readingTime}p
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="group flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
        {index !== undefined && (
          <span className="text-2xl font-black text-brand-700/80 w-6 flex-shrink-0 text-center font-serif">
            {index + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <Link
            to={`/danh-muc/${article.category.slug}`}
            className="text-xs font-medium text-brand-700 uppercase tracking-wide"
          >
            {article.category.name}
          </Link>
          <Link to={`/bai-viet/${article.slug}`}>
            <h4 className="font-semibold text-gray-900 group-hover:text-brand-700 text-sm line-clamp-2 leading-snug mt-1 transition">
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.views.toLocaleString()} lượt xem</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard vertical card
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <Link to={`/bai-viet/${article.slug}`} className="relative aspect-video overflow-hidden block">
        <img
          src={article.coverImage || defaultImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-brand-700/90 text-white text-xs font-semibold rounded shadow-sm">
          {article.category.name}
        </span>
      </Link>

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {article.readingTime} phút đọc
            </span>
          </div>

          <Link to={`/bai-viet/${article.slug}`}>
            <h3 className="font-bold text-gray-900 group-hover:text-brand-700 text-base md:text-lg line-clamp-2 leading-snug mb-2 transition">
              {article.title}
            </h3>
          </Link>

          <p className="text-gray-600 text-xs md:text-sm line-clamp-2 leading-relaxed mb-4">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center space-x-2 truncate mr-2">
            <img
              src={article.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.fullName)}`}
              alt={article.author.fullName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="truncate">{article.author.fullName}</span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="flex items-center" title="Lượt xem">
              <Eye className="w-3.5 h-3.5 mr-0.5" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
