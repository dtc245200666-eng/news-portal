import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StaticPage as StaticPageType } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const StaticPage: React.FC<{ defaultSlug?: string }> = ({ defaultSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = defaultSlug || paramSlug;

  const { data: page, isLoading } = useQuery<StaticPageType>({
    queryKey: ['staticPage', slug],
    queryFn: async () => {
      const res = await api.get(`/pages/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner text="Đang tải nội dung trang..." />;
  }

  if (!page) {
    return (
      <EmptyState
        title="Trang không tồn tại"
        description="Nội dung bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        actionText="Quay lại trang chủ"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  const breadcrumbs = [{ label: page.title }];

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 font-serif mb-6 pb-4 border-b border-gray-200">
          {page.title}
        </h1>

        <div
          className="article-content prose prose-lg max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};
