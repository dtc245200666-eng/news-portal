import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

let adminToken: string;
let userToken: string;
let sampleArticleSlug: string;
let sampleArticleId: string;

describe('NewsPortal Comprehensive API Test Suite', () => {
  beforeAll(async () => {
    // 1. Login as Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@newsportal.vn',
        password: 'Admin@Password123!',
      });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;

    // 2. Login as regular User
    const userRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'reader@newsportal.vn',
        password: 'Reader@Password123!',
      });
    expect(userRes.status).toBe(200);
    userToken = userRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Security Tests', () => {
    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@newsportal.vn',
          password: 'WrongPassword123!',
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should register a new user successfully', async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Nguyễn Văn Kiểm Thử',
          email: uniqueEmail,
          password: 'Test@Password123!',
          confirmPassword: 'Test@Password123!',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject registration when email already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Trùng Email',
          email: 'admin@newsportal.vn',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });
      expect(res.status).toBe(409);
    });

    it('should return current user profile via /auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@newsportal.vn');
      expect(res.body.data.role).toBe('SUPER_ADMIN');
    });

    it('should handle forgot password and reset password flow', async () => {
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'reader@newsportal.vn' });
      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.data.devToken).toBeDefined();

      const devToken = forgotRes.body.data.devToken;
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: devToken,
          newPassword: 'NewReaderPassword123!',
          confirmPassword: 'NewReaderPassword123!',
        });
      expect(resetRes.status).toBe(200);

      // Restore password
      const reForgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'reader@newsportal.vn' });
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: reForgotRes.body.data.devToken,
          newPassword: 'Reader@Password123!',
          confirmPassword: 'Reader@Password123!',
        });
    });
  });

  describe('2. Public Articles & Categories Tests', () => {
    it('should fetch published articles list with pagination', async () => {
      const res = await request(app).get('/api/v1/articles?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThan(0);

      sampleArticleSlug = res.body.data[0].slug;
      sampleArticleId = res.body.data[0].id;
    });

    it('should fetch single article by slug with full detail', async () => {
      const res = await request(app).get(`/api/v1/articles/${sampleArticleSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(sampleArticleSlug);
      expect(res.body.data.title).toBeDefined();
      expect(res.body.data.author).toBeDefined();
      expect(res.body.data.category).toBeDefined();
    });

    it('should return 404 for non-existent article', async () => {
      const res = await request(app).get('/api/v1/articles/bai-viet-khong-ton-tai-xyz');
      expect(res.status).toBe(404);
    });

    it('should search articles by keyword', async () => {
      const res = await request(app).get('/api/v1/search?q=Việt Nam');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should fetch categories tree', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('3. Comments & User Interaction Tests', () => {
    it('should post a comment when logged in', async () => {
      const res = await request(app)
        .post(`/api/v1/comments/articles/${sampleArticleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Bình luận thử nghiệm tự động từ Vitest suite.',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Bình luận thử nghiệm tự động từ Vitest suite.');
    });

    it('should reject comment submission for unauthenticated guest', async () => {
      const res = await request(app)
        .post(`/api/v1/comments/articles/${sampleArticleId}`)
        .send({
          content: 'Bình luận khách vãng lai',
        });
      expect(res.status).toBe(401);
    });

    it('should toggle like on an article', async () => {
      const res = await request(app)
        .post(`/api/v1/interactions/articles/${sampleArticleId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.liked).toBe('boolean');
    });

    it('should toggle bookmark on an article', async () => {
      const res = await request(app)
        .post(`/api/v1/interactions/articles/${sampleArticleId}/bookmark`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.bookmarked).toBe('boolean');
    });
  });

  describe('4. RBAC & Admin Security Tests', () => {
    it('should reject regular user from accessing admin dashboard (403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin to access dashboard and receive accurate stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalArticles).toBeGreaterThan(0);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
    });

    it('should allow admin to fetch user management list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should prevent admin from locking own account', async () => {
      // Find admin's own id
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      const myId = meRes.body.data.id;

      const lockRes = await request(app)
        .patch(`/api/v1/admin/users/${myId}/toggle-lock`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(lockRes.status).toBe(400);
    });
  });
});
