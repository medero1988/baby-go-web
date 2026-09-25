import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import {
  TaxonomyProvider,
  ProductsTaxonomyLayout,
} from '@/catalog/TaxonomyProvider';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { SearchPage } from '@/pages/SearchPage';
import { SearchItemPage } from '@/pages/SearchItemPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import {
  StoreEditPage,
  StoreOverviewPage,
  StorePage,
} from '@/pages/app/StorePage';
import { ProductsPage } from '@/pages/app/ProductsPage';
import { ProductFormPage } from '@/pages/app/ProductFormPage';
import { ProductDetailPage } from '@/pages/app/ProductDetailPage';
import { BundlesPage } from '@/pages/app/BundlesPage';
import { BundleFormPage } from '@/pages/app/BundleFormPage';
import { BundleDetailPage } from '@/pages/app/BundleDetailPage';
import { MovementsPage } from '@/pages/app/MovementsPage';

function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/search"
            element={
              <TaxonomyProvider>
                <SearchPage />
              </TaxonomyProvider>
            }
          />
          <Route
            path="/search/:kind/:id"
            element={
              <TaxonomyProvider>
                <SearchItemPage />
              </TaxonomyProvider>
            }
          />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <TaxonomyProvider>
                  <AppShell />
                </TaxonomyProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="store" element={<StorePage />}>
              <Route index element={<StoreOverviewPage />} />
              <Route path="edit" element={<StoreEditPage />} />
            </Route>
            <Route path="products" element={<ProductsTaxonomyLayout />}>
              <Route index element={<ProductsPage />} />
              <Route path="new" element={<ProductFormPage />} />
              <Route path=":id" element={<ProductDetailPage />} />
            </Route>
            <Route path="bundles" element={<BundlesPage />} />
            <Route path="bundles/new" element={<BundleFormPage />} />
            <Route path="bundles/:id/edit" element={<BundleFormPage />} />
            <Route path="bundles/:id" element={<BundleDetailPage />} />
            <Route path="movements" element={<MovementsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
