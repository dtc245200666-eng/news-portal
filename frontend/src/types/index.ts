export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'USER';
export type ArticleStatus = 'DRAFT' | 'PENDING' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  articlesCount?: number;
  commentsCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  articleCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImage?: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isEditorPick: boolean;
  views: number;
  readingTime: number;
  metaTitle?: string | null;
  metaDesc?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  authorId?: string;
  author: {
    id: string;
    fullName: string;
    avatar?: string | null;
    bio?: string | null;
  };
  categoryId?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  tags: Tag[];
  commentsCount?: number;
  likesCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  articleId: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
  userId: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string | null;
    role?: Role;
  };
  parentId?: string | null;
  replies?: Comment[];
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
  updatedAt: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  draftArticles: number;
  archivedArticles: number;
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  recentArticles: Array<{
    id: string;
    title: string;
    slug: string;
    status: ArticleStatus;
    views: number;
    createdAt: string;
    author: { fullName: string };
    category: { name: string };
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    targetType: string;
    createdAt: string;
    details?: string | null;
    user?: { fullName: string; email: string; role: Role } | null;
  }>;
  chartData: Array<{ day: string; views: number }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    query?: string;
  };
}
