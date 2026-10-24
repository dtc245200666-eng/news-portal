import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().optional().default(0),
  parentId: z.string().min(1).optional().nullable(),
});

export const tagSchema = z.object({
  name: z.string().min(2, 'Tên thẻ tag phải có ít nhất 2 ký tự').max(50),
  slug: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(2, 'Bình luận phải có ít nhất 2 ký tự').max(1000, 'Bình luận tối đa 1000 ký tự'),
  parentId: z.string().min(1).optional().nullable(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100).optional(),
  avatar: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').optional().or(z.literal('')),
  bio: z.string().max(500).optional().nullable(),
});

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional().nullable(),
  subject: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự').max(200),
  message: z.string().min(10, 'Nội dung tin nhắn ít nhất 10 ký tự').max(2000),
});
