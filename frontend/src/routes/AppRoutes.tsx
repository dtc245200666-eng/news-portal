import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/HomePage';
import { CategoryPage } from '../pages/CategoryPage';
import { ArticleDetailPage } from '../pages/ArticleDetailPage';
import { SearchPage } from '../pages/SearchPage';
import { TagPage } from '../pages/TagPage';
import { StaticPage } from '../pages/StaticPage';
import { ContactPage } from '../pages/ContactPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminArticlesPage } from '../pages/AdminArticlesPage';
import { AdminArticleEditPage } from '../pages/AdminArticleEditPage';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { AdminTagsPage } from '../pages/AdminTagsPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminCommentsPage } from '../pages/AdminCommentsPage';
import { AdminMediaPage } from '../pages/AdminMediaPage';
import { AdminPagesPage } from '../pages/AdminPagesPage';
import { AdminSettingsPage } from '../pages/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/AdminAuditLogsPage';
import { AdminContactMessagesPage } from '../pages/AdminContactMessagesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Portal Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/danh-muc/:slug" element={<CategoryPage />} />
        <Route path="/bai-viet/:slug" element={<ArticleDetailPage />} />
        <Route path="/tim-kiem" element={<SearchPage />} />
        <Route path="/the/:slug" element={<TagPage />} />
        <Route path="/gioi-thieu" element={<StaticPage defaultSlug="gioi-thieu" />} />
        <Route path="/chinh-sach-bao-mat" element={<StaticPage defaultSlug="chinh-sach-bao-mat" />} />
        <Route path="/dieu-khoan-su-dung" element={<StaticPage defaultSlug="dieu-khoan-su-dung" />} />
        <Route path="/chinh-sach-binh-luan" element={<StaticPage defaultSlug="chinh-sach-binh-luan" />} />
        <Route path="/lien-he" element={<ContactPage />} />

        {/* User Profile Routes */}
        <Route
          path="/tai-khoan"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tai-khoan/tin-da-luu"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Authentication Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
        <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
      </Route>

      {/* 3. Admin Panel Routes (Protected for Staff: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="bai-viet" element={<AdminArticlesPage />} />
        <Route path="bai-viet/tao-moi" element={<AdminArticleEditPage />} />
        <Route path="bai-viet/:id" element={<AdminArticleEditPage />} />
        <Route
          path="danh-muc"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="the"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <AdminTagsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="binh-luan"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}>
              <AdminCommentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="media" element={<AdminMediaPage />} />
        <Route
          path="nguoi-dung"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="trang-tinh"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminPagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cai-dat"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nhat-ky"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="lien-he"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminContactMessagesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 4. 404 Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
