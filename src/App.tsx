import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SupportChatbot } from './components/chat/SupportChatbot';
import { ScrollToTop } from './components/layout/ScrollToTop';

// Public pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { WhyChooseUsPage } from './pages/WhyChooseUsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';

// Admin components & pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Staff components & pages
import { StaffLayout } from './components/staff/StaffLayout';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffAppointmentsPage } from './pages/staff/StaffAppointmentsPage';
import { StaffClientsPage } from './pages/staff/StaffClientsPage';
import { StaffPerformancePage } from './pages/staff/StaffPerformancePage';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';
import { FirebaseSetupNotice } from './components/common/FirebaseSetupNotice';

// Route Guards
const CustomerProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-[#777A70]">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const AdminProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-[#777A70]">Verifying credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is a staff practitioner without full admin rights, redirect to staff panel
  if (user.role === 'staff') {
    return <Navigate to="/staff" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

const StaffProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-[#777A70]">Verifying credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Both staff and admin users can access the staff portal
  if (user.role !== 'staff' && user.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return (
    <StaffLayout>
      <Outlet />
    </StaffLayout>
  );
};

// Public layout wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#252923]">
      <FirebaseSetupNotice />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SupportChatbot />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public site layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />

            {/* Customer Protected routes */}
            <Route element={<CustomerProtectedRoute />}>
              <Route path="/account" element={<CustomerAccountPage />} />
              <Route path="/account/appointments" element={<CustomerAccountPage />} />
              <Route path="/account/profile" element={<CustomerAccountPage />} />
            </Route>
          </Route>

          {/* Admin Protected routes */}
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="inquiries" element={<AdminInquiriesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Staff Protected routes */}
          <Route path="/staff" element={<StaffProtectedRoute />}>
            <Route index element={<StaffDashboardPage />} />
            <Route path="appointments" element={<StaffAppointmentsPage />} />
            <Route path="clients" element={<StaffClientsPage />} />
            <Route path="performance" element={<StaffPerformancePage />} />
            <Route path="profile" element={<StaffProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
