import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ArticleCard } from './ArticleCard';
import { Article } from '../types';

const mockArticle: Article = {
  id: '123-abc',
  title: 'Bài viết kiểm thử tự động',
  slug: 'bai-viet-kiem-thu-tu-dong',
  summary: 'Mô tả ngắn gọn cho bài viết kiểm thử',
  content: '<p>Nội dung chi tiết</p>',
  coverImage: 'https://example.com/test.jpg',
  status: 'PUBLISHED',
  isFeatured: true,
  isEditorPick: false,
  views: 1250,
  readingTime: 4,
  publishedAt: '2026-10-21T12:00:00Z',
  createdAt: '2026-10-21T10:00:00Z',
  author: {
    id: 'user-1',
    fullName: 'Nhà báo Nguyễn Văn A',
    avatar: null,
  },
  category: {
    id: 'cat-1',
    name: 'Công nghệ',
    slug: 'cong-nghe',
  },
  tags: [
    { id: 'tag-1', name: 'AI', slug: 'ai' },
  ],
  commentsCount: 5,
  likesCount: 12,
};

describe('ArticleCard Component', () => {
  it('renders standard article card correctly', () => {
    render(
      <BrowserRouter>
        <ArticleCard article={mockArticle} variant="standard" />
      </BrowserRouter>
    );

    expect(screen.getByText('Bài viết kiểm thử tự động')).toBeDefined();
    expect(screen.getByText('Công nghệ')).toBeDefined();
    expect(screen.getByText('Nhà báo Nguyễn Văn A')).toBeDefined();
    expect(screen.getByText(/4 phút đọc/)).toBeDefined();
  });

  it('renders hero variant correctly', () => {
    render(
      <BrowserRouter>
        <ArticleCard article={mockArticle} variant="hero" />
      </BrowserRouter>
    );

    expect(screen.getByText('Bài viết kiểm thử tự động')).toBeDefined();
    expect(screen.getByText('Mô tả ngắn gọn cho bài viết kiểm thử')).toBeDefined();
  });
});
