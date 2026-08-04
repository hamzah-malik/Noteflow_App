import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/shared/ToastProvider';
import PublicLayout from '@/components/shared/PublicLayout';
import AppShell from '@/components/shared/AppShell';
import ProtectedRoute from '@/router/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import NotesPage from '@/pages/NotesPage';
import NoteDetailPage from '@/pages/NoteDetailPage';
import NotificationsPage from '@/pages/NotificationsPage';
import FriendsPage from '@/pages/FriendsPage';
import SettingsPage from '@/pages/SettingsPage';
import AccessRequestsPage from '@/pages/AccessRequestsPage';
import SharedWithMePage from '@/pages/SharedWithMePage';
import FriendsNotesPage from '@/pages/FriendsNotesPage';
import FriendProfilePage from '@/pages/FriendProfilePage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import UploadPage from '@/features/notes/UploadPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing site - top navbar */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated app - sidebar shell, matches the dashboard mockup */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notes/:id" element={<NoteDetailPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/access-requests" element={<AccessRequestsPage />} />
              <Route path="/shared" element={<SharedWithMePage />} />
              <Route path="/friends-notes" element={<FriendsNotesPage />} />
              <Route path="/friends/:id" element={<FriendProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
