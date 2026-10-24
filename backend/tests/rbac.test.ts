import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import { Role, ArticleStatus } from '@prisma/client';

let superAdminToken: string;
let adminToken: string;
let editorToken: string;
let authorToken: string;
let authorId: string;
let userToken: string;
let userId: string;
let testArticleId: string;
let testPublishedArticleId: string;
let testCategoryId: string;

describe('Role-Based Access Control (RBAC) Comprehensive Test Suite', () => {
  beforeAll(async () => {
    // 1. Login as SUPER_ADMIN
    const saRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@newsportal.vn', password: 'Admin@Password123!' });
    expect(saRes.status).toBe(200);
    superAdminToken = saRes.body.data.accessToken;

    // Create or retrieve an ADMIN user for testing
    let adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (!adminUser) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('AdminUser@123!', 10);
      adminUser = await prisma.user.create({
        data: {
          fullName: 'Trưởng Ban Biên Tập',
          email: 'admin_test@newsportal.vn',
          username: 'admintest',
          password: hash,
          role: Role.ADMIN,
          isActive: true,
        },
      });
    }

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminUser.email, password: 'AdminUser@123!' });
    // If password mismatch due to seeded account, we can re-hash or authenticate
    if (adminLoginRes.status === 200) {
      adminToken = adminLoginRes.body.data.accessToken;
    } else {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('AdminUser@123!', 10);
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { password: hash },
      });
      const retryRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: adminUser.email, password: 'AdminUser@123!' });
      adminToken = retryRes.body.data.accessToken;
    }

    // 2. Login as EDITOR
    const edRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'editor@newsportal.vn', password: 'Editor@Password123!' });
    expect(edRes.status).toBe(200);
    editorToken = edRes.body.data.accessToken;

    // 3. Login as AUTHOR
    const auRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'author_nam@newsportal.vn', password: 'Author@Password123!' });
    expect(auRes.status).toBe(200);
    authorToken = auRes.body.data.accessToken;
    authorId = auRes.body.data.user.id;

    // 4. Login as USER
    const uRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reader@newsportal.vn', password: 'Reader@Password123!' });
    if (uRes.status === 200) {
      userToken = uRes.body.data.accessToken;
      userId = uRes.body.data.user.id;
    } else {
      // In case password was reset in other tests, reset to known password
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('Reader@Password123!', 10);
      const reader = await prisma.user.update({
        where: { email: 'reader@newsportal.vn' },
        data: { password: hash },
      });
      const reLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'reader@newsportal.vn', password: 'Reader@Password123!' });
      userToken = reLogin.body.data.accessToken;
      userId = reader.id;
    }

    // Retrieve a category for article tests
    const cat = await prisma.category.findFirst();
    testCategoryId = cat!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. GUEST Role (Unauthenticated Access Controls)', () => {
    it('should return 401 when accessing protected profile /users/me', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 when accessing /admin/dashboard', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('should return 401 when attempting to post a comment', async () => {
      const res = await request(app)
        .post(`/api/v1/comments/articles/any-article-id`)
        .send({ content: 'Bình luận khách vãng lai' });
      expect(res.status).toBe(401);
    });

    it('should return 401 when attempting to like an article', async () => {
      const res = await request(app).post(`/api/v1/interactions/articles/any-id/like`);
      expect(res.status).toBe(401);
    });
  });

  describe('2. USER Role (Regular Reader Access Controls)', () => {
    it('should return 403 when USER attempts to access /admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('không có quyền');
    });

    it('should return 403 when USER attempts to access /admin/articles', async () => {
      const res = await request(app)
        .get('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 403 when USER attempts to access /admin/users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow USER to post comments and delete only their own comments', async () => {
      // Find an article to comment on
      const article = await prisma.article.findFirst({ where: { status: ArticleStatus.PUBLISHED } });
      expect(article).toBeDefined();

      // Post comment
      const postCommentRes = await request(app)
        .post(`/api/v1/comments/articles/${article!.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Bình luận kiểm thử quyền người dùng độc giả' });
      expect(postCommentRes.status).toBe(201);
      const myCommentId = postCommentRes.body.data.id;

      // Create another comment by admin
      const adminComment = await prisma.comment.create({
        data: {
          content: 'Bình luận của Admin',
          articleId: article!.id,
          userId: (await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } }))!.id,
        },
      });

      // Try deleting admin comment as regular USER -> 403
      const deleteOtherRes = await request(app)
        .delete(`/api/v1/comments/${adminComment.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(deleteOtherRes.status).toBe(403);

      // Delete own comment -> 200
      const deleteOwnRes = await request(app)
        .delete(`/api/v1/comments/${myCommentId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(deleteOwnRes.status).toBe(200);

      // Clean up admin comment
      await prisma.comment.delete({ where: { id: adminComment.id } });
    });
  });

  describe('3. AUTHOR Role (Journalist Access Controls)', () => {
    it('should allow AUTHOR to access /admin/dashboard with author-scoped metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalArticles).toBeDefined();
      expect(res.body.data.totalUsers).toBe(0); // scoped to 0 for author privacy
    });

    it('should force status to PENDING and isFeatured to false when AUTHOR attempts to publish', async () => {
      const res = await request(app)
        .post('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Bài Viết Tác Giả Tự Xuất Bản ' + Date.now(),
          summary: 'Tóm tắt bài viết của tác giả gửi lên tòa soạn',
          content: '<p>Nội dung bài viết cần được kiểm duyệt trước khi xuất bản.</p>',
          categoryId: testCategoryId,
          status: ArticleStatus.PUBLISHED, // Attempting to publish directly
          isFeatured: true, // Attempting to feature directly
          isEditorPick: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe(ArticleStatus.PENDING); // Automatically forced to PENDING
      expect(res.body.data.isFeatured).toBe(false); // Automatically forced to false
      expect(res.body.data.isEditorPick).toBe(false);
      testArticleId = res.body.data.id;
    });

    it('should return 403 when AUTHOR attempts to delete a PUBLISHED article', async () => {
      // Create a published article owned by author (simulating editor published it)
      const publishedArticle = await prisma.article.create({
        data: {
          title: 'Bài viết đã được xuất bản ' + Date.now(),
          slug: 'bai-viet-xuat-ban-' + Date.now(),
          summary: 'Tóm tắt bài viết đã đăng',
          content: '<p>Bài viết này đã lên trang nhất.</p>',
          categoryId: testCategoryId,
          authorId: authorId,
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
      testPublishedArticleId = publishedArticle.id;

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/articles/${publishedArticle.id}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.message).toContain('không thể tự xóa bài viết đã xuất bản');
    });

    it('should allow AUTHOR to delete their own DRAFT / PENDING article', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/articles/${testArticleId}`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(deleteRes.status).toBe(200);
    });

    it('should return 403 when AUTHOR attempts to access /admin/users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${authorToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 403 when AUTHOR attempts to create a category', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ name: 'Chuyên mục thử nghiệm' });
      expect(res.status).toBe(403);
    });

    it('should return 403 when AUTHOR attempts to create a tag directly', async () => {
      const res = await request(app)
        .post('/api/v1/admin/tags')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ name: 'TagThua' });
      expect(res.status).toBe(403);
    });
  });

  describe('4. EDITOR Role (Editorial Management Controls)', () => {
    it('should allow EDITOR to publish an article', async () => {
      // Create a draft article
      const draft = await prisma.article.create({
        data: {
          title: 'Bài Viết Chờ Biên Tập Duyệt ' + Date.now(),
          slug: 'bai-cho-bien-tap-' + Date.now(),
          summary: 'Tóm tắt bài viết',
          content: '<p>Nội dung chi tiết...</p>',
          categoryId: testCategoryId,
          authorId: authorId,
          status: ArticleStatus.PENDING,
        },
      });

      const publishRes = await request(app)
        .patch(`/api/v1/admin/articles/${draft.id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ status: ArticleStatus.PUBLISHED, isFeatured: true });

      expect(publishRes.status).toBe(200);
      expect(publishRes.body.data.status).toBe(ArticleStatus.PUBLISHED);
      expect(publishRes.body.data.isFeatured).toBe(true);

      // Clean up
      await prisma.article.delete({ where: { id: draft.id } });
    });

    it('should allow EDITOR to create a category and tag', async () => {
      const catRes = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'Chuyên Mục Test Editor ' + Date.now() });
      expect(catRes.status).toBe(201);

      const tagRes = await request(app)
        .post('/api/v1/admin/tags')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ name: 'TagTestEditor' + Date.now() });
      expect(tagRes.status).toBe(201);

      // Clean up
      await prisma.category.delete({ where: { id: catRes.body.data.id } });
      await prisma.tag.delete({ where: { id: tagRes.body.data.id } });
    });

    it('should return 403 when EDITOR attempts to access /admin/users or /admin/audit-logs', async () => {
      const usersRes = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${editorToken}`);
      expect(usersRes.status).toBe(403);

      const auditRes = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${editorToken}`);
      expect(auditRes.status).toBe(403);
    });
  });

  describe('5. ADMIN Role (Administrative Controls & Hierarchy Protection)', () => {
    it('should allow ADMIN to list users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 403 when ADMIN attempts to lock a SUPER_ADMIN account', async () => {
      const superAdminUser = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } });
      expect(superAdminUser).toBeDefined();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${superAdminUser!.id}/toggle-lock`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Không có quyền khóa tài khoản Quản trị cấp cao');
    });

    it('should return 403 when ADMIN attempts to promote someone to SUPER_ADMIN', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: Role.SUPER_ADMIN });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Chỉ SUPER_ADMIN');
    });
  });

  describe('6. SUPER_ADMIN Role (Full Privileges & Root Protection)', () => {
    it('should return 400 when SUPER_ADMIN attempts to lock themselves', async () => {
      const superAdminUser = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } });
      const res = await request(app)
        .patch(`/api/v1/admin/users/${superAdminUser!.id}/toggle-lock`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('tự khóa');
    });

    it('should allow SUPER_ADMIN to change user role and lock/unlock regular users', async () => {
      // 1. Change role to EDITOR
      const roleRes = await request(app)
        .patch(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ role: Role.EDITOR });
      expect(roleRes.status).toBe(200);
      expect(roleRes.body.data.role).toBe(Role.EDITOR);

      // 2. Lock user
      const lockRes = await request(app)
        .patch(`/api/v1/admin/users/${userId}/toggle-lock`)
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(lockRes.status).toBe(200);
      expect(lockRes.body.data.isActive).toBe(false);

      // 3. Unlock user
      const unlockRes = await request(app)
        .patch(`/api/v1/admin/users/${userId}/toggle-lock`)
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(unlockRes.status).toBe(200);
      expect(unlockRes.body.data.isActive).toBe(true);

      // 4. Restore role to USER
      await request(app)
        .patch(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ role: Role.USER });
    });

    it('should allow SUPER_ADMIN to clean up published test articles', async () => {
      if (testPublishedArticleId) {
        const delRes = await request(app)
          .delete(`/api/v1/admin/articles/${testPublishedArticleId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);
        expect(delRes.status).toBe(200);
      }
    });
  });
});
