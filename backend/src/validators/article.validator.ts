import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';

export const createArticleSchema = z.object({
  title: z.string().min(5, 'Tiêu đề bài viết phải có ít nhất 5 ký tự').max(300, 'Tiêu đề không quá 300 ký tự'),
  slug: z.string().optional(),
  summary: z.string().min(10, 'Mô tả ngắn/tóm tắt phải có ít nhất 10 ký tự').max(600, 'Tóm tắt không quá 600 ký tự'),
  content: z.string().min(20, 'Nội dung bài viết phải có ít nhất 20 ký tự'),
  coverImage: z.string().url('Ảnh đại diện không đúng định dạng URL').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Danh mục không hợp lệ'),
  tagIds: z.array(z.string().min(1)).optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  isFeatured: z.boolean().optional(),
  isEditorPick: z.boolean().optional(),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(300).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial();
