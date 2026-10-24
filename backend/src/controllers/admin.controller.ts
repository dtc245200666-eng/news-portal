import { Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ArticleStatus, CommentStatus, Role } from '@prisma/client';
import { slugifyVietnamese } from '../utils/slugify';
import { cleanHtml } from '../utils/sanitize';
import { createAuditLog } from '../utils/audit';

// 6.1 Dashboard Stats
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAuthor = req.user?.role === Role.AUTHOR;
    const authorId = req.user?.id;

    if (isAuthor && authorId) {
      const [
        totalArticles,
        publishedArticles,
        pendingArticles,
        draftArticles,
        archivedArticles,
        viewsAggregate,
        recentArticles,
        recentLogs,
      ] = await Promise.all([
        prisma.article.count({ where: { authorId } }),
        prisma.article.count({ where: { authorId, status: ArticleStatus.PUBLISHED } }),
        prisma.article.count({ where: { authorId, status: ArticleStatus.PENDING } }),
        prisma.article.count({ where: { authorId, status: ArticleStatus.DRAFT } }),
        prisma.article.count({ where: { authorId, status: ArticleStatus.ARCHIVED } }),
        prisma.article.aggregate({ where: { authorId }, _sum: { views: true } }),
        prisma.article.findMany({
          where: { authorId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            views: true,
            createdAt: true,
            author: { select: { fullName: true } },
            category: { select: { name: true } },
          },
        }),
        prisma.auditLog.findMany({
          where: { userId: authorId },
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, email: true, role: true } },
          },
        }),
      ]);

      const totalAuthorViews = viewsAggregate._sum.views || 0;
      const chartData = [
        { day: 'Thứ 2', views: Math.round(totalAuthorViews * 0.1) },
        { day: 'Thứ 3', views: Math.round(totalAuthorViews * 0.12) },
        { day: 'Thứ 4', views: Math.round(totalAuthorViews * 0.15) },
        { day: 'Thứ 5', views: Math.round(totalAuthorViews * 0.18) },
        { day: 'Thứ 6', views: Math.round(totalAuthorViews * 0.22) },
        { day: 'Thứ 7', views: Math.round(totalAuthorViews * 0.13) },
        { day: 'Chủ nhật', views: Math.round(totalAuthorViews * 0.1) },
      ];

      return sendSuccess(res, {
        totalArticles,
        publishedArticles,
        pendingArticles,
        draftArticles,
        archivedArticles,
        totalUsers: 0,
        totalComments: 0,
        pendingComments: 0,
        totalViews: totalAuthorViews,
        recentArticles,
        recentLogs,
        chartData,
      }, 'Lấy dữ liệu thống kê tác giả thành công');
    }

    const [
      totalArticles,
      publishedArticles,
      pendingArticles,
      draftArticles,
      archivedArticles,
      totalUsers,
      totalComments,
      pendingComments,
      viewsAggregate,
      recentArticles,
      recentLogs,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.PENDING } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          author: { select: { fullName: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, role: true } },
        },
      }),
    ]);

    // Simulated 7-day view analytics for charts
    const chartData = [
      { day: 'Thứ 2', views: 3200 },
      { day: 'Thứ 3', views: 4100 },
      { day: 'Thứ 4', views: 3900 },
      { day: 'Thứ 5', views: 4800 },
      { day: 'Thứ 6', views: 5600 },
      { day: 'Thứ 7', views: 7200 },
      { day: 'Chủ nhật', views: 8100 },
    ];

    return sendSuccess(res, {
      totalArticles,
      publishedArticles,
      pendingArticles,
      draftArticles,
      archivedArticles,
      totalUsers,
      totalComments,
      pendingComments,
      totalViews: viewsAggregate._sum.views || 0,
      recentArticles,
      recentLogs,
      chartData,
    }, 'Lấy dữ liệu thống kê dashboard thành công');
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return sendError(res, 'Lỗi lấy thống kê dashboard', 500);
  }
};

// 6.2 Admin Articles Management
export const getAdminArticles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const status = req.query.status as ArticleStatus;
    const categoryId = req.query.categoryId as string;
    const search = req.query.search as string;

    const where: any = {};

    // Authors can only see their own articles in admin list unless staff
    if (req.user?.role === Role.AUTHOR) {
      where.authorId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const formatted = articles.map((art) => ({
      ...art,
      tags: art.tags.map((t) => t.tag),
      commentsCount: art._count.comments,
      likesCount: art._count.likes,
    }));

    return sendSuccess(res, formatted, 'Lấy danh sách bài viết quản trị thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách bài viết quản trị', 500);
  }
};

export const getAdminArticleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: { select: { tagId: true } },
      },
    });

    if (!article) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    if (req.user?.role === Role.AUTHOR && article.authorId !== req.user.id) {
      return sendError(res, 'Bạn không có quyền xem bài viết của tác giả khác', 403);
    }

    return sendSuccess(res, {
      ...article,
      tagIds: article.tags.map((t) => t.tagId),
    }, 'Lấy thông tin bài viết thành công');
  } catch (error) {
    return sendError(res, 'Lỗi lấy thông tin bài viết', 500);
  }
};

export const createAdminArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Chưa đăng nhập', 401);

    const {
      title,
      slug: customSlug,
      summary,
      content,
      coverImage,
      categoryId,
      tagIds = [],
      status = ArticleStatus.DRAFT,
      isFeatured = false,
      isEditorPick = false,
      metaTitle,
      metaDesc,
      scheduledAt,
    } = req.body;

    // Authors cannot publish directly without review
    let initialStatus = status;
    if (req.user.role === Role.AUTHOR && status === ArticleStatus.PUBLISHED) {
      initialStatus = ArticleStatus.PENDING;
    }

    let slug = customSlug ? slugifyVietnamese(customSlug) : slugifyVietnamese(title);

    // Ensure unique slug
    const existingSlug = await prisma.article.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanBody = cleanHtml(content);
    const readingTime = Math.max(1, Math.round(cleanBody.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));

    const publishedAt = initialStatus === ArticleStatus.PUBLISHED ? new Date() : null;

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary,
        content: cleanBody,
        coverImage: coverImage || null,
        status: initialStatus,
        isFeatured: isFeatured && req.user.role !== Role.AUTHOR,
        isEditorPick: isEditorPick && req.user.role !== Role.AUTHOR,
        views: 0,
        readingTime,
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || summary,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        authorId: req.user.id,
        categoryId,
        tags: {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        category: true,
        author: { select: { id: true, fullName: true } },
      },
    });

    await createAuditLog(
      req,
      'CREATE_ARTICLE',
      'ARTICLE',
      article.id,
      `Tạo bài viết mới: "${article.title}" với trạng thái ${article.status}`
    );

    return sendSuccess(res, article, 'Tạo bài viết thành công', 201);
  } catch (error: any) {
    console.error('createAdminArticle error:', error);
    return sendError(res, 'Lỗi khi tạo bài viết', 500);
  }
};

export const updateAdminArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Chưa đăng nhập', 401);

    const { id } = req.params;
    const {
      title,
      slug: customSlug,
      summary,
      content,
      coverImage,
      categoryId,
      tagIds,
      status,
      isFeatured,
      isEditorPick,
      metaTitle,
      metaDesc,
      scheduledAt,
    } = req.body;

    const existing = await prisma.article.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existing) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    // Permission check
    if (req.user.role === Role.AUTHOR && existing.authorId !== req.user.id) {
      return sendError(res, 'Bạn không thể sửa bài viết của tác giả khác', 403);
    }

    let finalStatus = status !== undefined ? status : existing.status;
    if (req.user.role === Role.AUTHOR && finalStatus === ArticleStatus.PUBLISHED) {
      finalStatus = ArticleStatus.PENDING;
    }

    let slug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      slug = slugifyVietnamese(customSlug);
      const duplicateSlug = await prisma.article.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicateSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const cleanBody = content !== undefined ? cleanHtml(content) : existing.content;
    const readingTime = Math.max(1, Math.round(cleanBody.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));

    // Handle published date
    let publishedAt = existing.publishedAt;
    if (finalStatus === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        slug,
        ...(summary && { summary }),
        content: cleanBody,
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        status: finalStatus,
        ...(isFeatured !== undefined && req.user.role !== Role.AUTHOR && { isFeatured }),
        ...(isEditorPick !== undefined && req.user.role !== Role.AUTHOR && { isEditorPick }),
        readingTime,
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        publishedAt,
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(categoryId && { categoryId }),
        ...(tagIds !== undefined && {
          tags: {
            create: tagIds.map((tagId: string) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
      include: {
        category: true,
        author: { select: { id: true, fullName: true } },
      },
    });

    await createAuditLog(
      req,
      'UPDATE_ARTICLE',
      'ARTICLE',
      updated.id,
      `Cập nhật bài viết: "${updated.title}"`
    );

    return sendSuccess(res, updated, 'Cập nhật bài viết thành công');
  } catch (error) {
    console.error('updateAdminArticle error:', error);
    return sendError(res, 'Lỗi cập nhật bài viết', 500);
  }
};

export const deleteAdminArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Chưa đăng nhập', 401);

    const { id } = req.params;

    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(res, 'Bài viết không tồn tại', 404);
    }

    if (req.user.role === Role.AUTHOR) {
      if (existing.authorId !== req.user.id) {
        return sendError(res, 'Bạn không có quyền xóa bài viết của người khác', 403);
      }
      if (existing.status === ArticleStatus.PUBLISHED) {
        return sendError(res, 'Tác giả không thể tự xóa bài viết đã xuất bản. Vui lòng liên hệ ban biên tập.', 403);
      }
    }

    await prisma.article.delete({
      where: { id },
    });

    await createAuditLog(
      req,
      'DELETE_ARTICLE',
      'ARTICLE',
      id,
      `Xóa bài viết: "${existing.title}"`
    );

    return sendSuccess(res, null, 'Xóa bài viết thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi xóa bài viết', 500);
  }
};

// 6.3 Categories Management
export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug: customSlug, description, order = 0, parentId } = req.body;

    let slug = customSlug ? slugifyVietnamese(customSlug) : slugifyVietnamese(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'Đường dẫn slug cho danh mục này đã tồn tại', 409);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        order: order || 0,
        parentId: parentId || null,
      },
    });

    await createAuditLog(req, 'CREATE_CATEGORY', 'CATEGORY', category.id, `Tạo danh mục mới: ${category.name}`);

    return sendSuccess(res, category, 'Tạo danh mục thành công', 201);
  } catch (error) {
    return sendError(res, 'Lỗi khi tạo danh mục', 500);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug: customSlug, description, order, parentId } = req.body;

    let slug: string | undefined;
    if (customSlug) {
      slug = slugifyVietnamese(customSlug);
      const duplicate = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicate) {
        return sendError(res, 'Đường dẫn slug này đã được danh mục khác sử dụng', 409);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    await createAuditLog(req, 'UPDATE_CATEGORY', 'CATEGORY', category.id, `Cập nhật danh mục: ${category.name}`);

    return sendSuccess(res, category, 'Cập nhật danh mục thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi cập nhật danh mục', 500);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category has articles
    const articleCount = await prisma.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return sendError(
        res,
        `Không thể xóa danh mục này vì đang có ${articleCount} bài viết trực thuộc. Vui lòng chuyển bài viết sang danh mục khác trước.`,
        400
      );
    }

    // Check if category has child categories
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return sendError(
        res,
        `Không thể xóa vì danh mục này có ${childCount} danh mục con.`,
        400
      );
    }

    const deleted = await prisma.category.delete({
      where: { id },
    });

    await createAuditLog(req, 'DELETE_CATEGORY', 'CATEGORY', id, `Xóa danh mục: ${deleted.name}`);

    return sendSuccess(res, null, 'Xóa danh mục thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi xóa danh mục', 500);
  }
};

// 6.4 Tags Management
export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug: customSlug } = req.body;
    const slug = customSlug ? slugifyVietnamese(customSlug) : slugifyVietnamese(name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'Thẻ tag đã tồn tại', 409);
    }

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    await createAuditLog(req, 'CREATE_TAG', 'TAG', tag.id, `Tạo thẻ mới: ${tag.name}`);

    return sendSuccess(res, tag, 'Tạo thẻ tag thành công', 201);
  } catch (error) {
    return sendError(res, 'Lỗi khi tạo thẻ tag', 500);
  }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug: customSlug } = req.body;

    let slug: string | undefined;
    if (customSlug) {
      slug = slugifyVietnamese(customSlug);
      const duplicate = await prisma.tag.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicate) {
        return sendError(res, 'Slug thẻ tag đã tồn tại', 409);
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    return sendSuccess(res, tag, 'Cập nhật thẻ tag thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi cập nhật thẻ tag', 500);
  }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.tag.delete({ where: { id } });

    await createAuditLog(req, 'DELETE_TAG', 'TAG', id, 'Xóa thẻ tag');

    return sendSuccess(res, null, 'Xóa thẻ tag thành công');
  } catch (error) {
    return sendError(res, 'Lỗi khi xóa thẻ tag', 500);
  }
};

// 6.5 User Management
export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const role = req.query.role as Role;
    const search = req.query.search as string;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { articles: true, comments: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      ...u,
      articlesCount: u._count.articles,
      commentsCount: u._count.comments,
    }));

    return sendSuccess(res, formatted, 'Lấy danh sách người dùng thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách người dùng', 500);
  }
};

export const toggleUserLock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.id === id) {
      return sendError(res, 'Bạn không thể tự khóa tài khoản của chính mình', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return sendError(res, 'Người dùng không tồn tại', 404);
    }

    // Prevent non-superadmin from locking superadmin
    if (targetUser.role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) {
      return sendError(res, 'Không có quyền khóa tài khoản Quản trị cấp cao (SUPER_ADMIN)', 403);
    }

    // Safety: Protect the last active SUPER_ADMIN
    if (targetUser.role === Role.SUPER_ADMIN && targetUser.isActive) {
      const activeSuperAdmins = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN, isActive: true },
      });
      if (activeSuperAdmins <= 1) {
        return sendError(res, 'Không thể khóa Quản trị viên cấp cao duy nhất đang hoạt động của hệ thống', 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !targetUser.isActive },
      select: { id: true, email: true, isActive: true },
    });

    await createAuditLog(
      req,
      updated.isActive ? 'UNLOCK_USER' : 'LOCK_USER',
      'USER',
      id,
      `${updated.isActive ? 'Mở khóa' : 'Khóa'} tài khoản người dùng: ${targetUser.email}`
    );

    return sendSuccess(
      res,
      updated,
      updated.isActive ? 'Đã mở khóa tài khoản thành công' : 'Đã khóa tài khoản người dùng'
    );
  } catch (error) {
    return sendError(res, 'Lỗi thao tác khóa tài khoản', 500);
  }
};

export const changeUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user!;

    if (!Object.values(Role).includes(role)) {
      return sendError(res, 'Vai trò không hợp lệ', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return sendError(res, 'Người dùng không tồn tại', 404);
    }

    // Safety: Protect the last SUPER_ADMIN
    if (targetUser.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN, isActive: true },
      });
      if (superAdminCount <= 1) {
        return sendError(res, 'Không thể hạ quyền Quản trị viên cấp cao duy nhất của hệ thống', 400);
      }
    }

    // Non-superadmin cannot assign or demote SUPER_ADMIN
    if ((role === Role.SUPER_ADMIN || targetUser.role === Role.SUPER_ADMIN) && currentUser.role !== Role.SUPER_ADMIN) {
      return sendError(res, 'Chỉ SUPER_ADMIN mới có quyền phân quyền SUPER_ADMIN', 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    await createAuditLog(
      req,
      'CHANGE_USER_ROLE',
      'USER',
      id,
      `Thay đổi vai trò của ${targetUser.email} thành ${role}`
    );

    return sendSuccess(res, updated, `Thay đổi vai trò thành ${role} thành công`);
  } catch (error) {
    return sendError(res, 'Lỗi phân quyền người dùng', 500);
  }
};

// 6.6 Comments Management
export const getAdminComments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const status = req.query.status as CommentStatus;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, avatar: true } },
          article: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return sendSuccess(res, comments, 'Lấy danh sách bình luận quản trị thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách bình luận quản trị', 500);
  }
};

export const updateCommentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(CommentStatus).includes(status)) {
      return sendError(res, 'Trạng thái bình luận không hợp lệ', 400);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { fullName: true } },
      },
    });

    await createAuditLog(
      req,
      'UPDATE_COMMENT_STATUS',
      'COMMENT',
      id,
      `Thay đổi trạng thái bình luận sang ${status}`
    );

    return sendSuccess(res, updated, `Đã cập nhật trạng thái bình luận sang ${status}`);
  } catch (error) {
    return sendError(res, 'Lỗi cập nhật bình luận', 500);
  }
};

// 6.10 Audit Logs Management
export const getAdminAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
    const skip = (page - 1) * limit;

    const action = req.query.action as string;

    const where: any = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return sendSuccess(res, logs, 'Lấy nhật ký quản trị thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 'Lỗi lấy nhật ký hệ thống', 500);
  }
};
