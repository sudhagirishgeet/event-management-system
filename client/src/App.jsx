import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import EventDirectoryPage from './pages/EventDirectoryPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AttendeeDashboardPage from './pages/AttendeeDashboardPage';
import TicketViewPage from './pages/TicketViewPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import OrganizerEventCreatePage from './pages/OrganizerEventCreatePage';
import OrganizerCheckInPage from './pages/OrganizerCheckInPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-base text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventDirectoryPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Attendee Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}><AttendeeDashboardPage /></ProtectedRoute>} />
          <Route path="/my-tickets/:id" element={<ProtectedRoute roles={['ATTENDEE', 'ORGANIZER', 'ADMIN']}><TicketViewPage /></ProtectedRoute>} />

          {/* Organizer Protected Routes */}
          <Route path="/organizer/dashboard" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><OrganizerDashboardPage /></ProtectedRoute>} />
          <Route path="/organizer/events/create" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><OrganizerEventCreatePage /></ProtectedRoute>} />
          <Route path="/organizer/events/:id/checkin" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><OrganizerCheckInPage /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
