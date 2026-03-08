import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/auth/Profile';
import UserDashboard from '../pages/user/UserDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CreateComplaint from '../pages/user/CreateComplaint';
import MyComplaints from '../pages/user/MyComplaints';
import UserComplaintDetails from '../pages/user/UserComplaintDetails';
import Notices from '../pages/user/Notices';
import AllComplaints from '../pages/admin/AllComplaints';
import UploadNotice from '../pages/admin/UploadNotice';
import Analytics from '../pages/admin/Analytics';
import AdminComplaintDetails from '../pages/admin/AdminComplaintDetails';
import UserPoll from '../pages/user/UserPoll';
import AdminPoll from '../pages/admin/AdminPoll';
import UserContacts from '../pages/user/UserContacts';
import AdminContacts from '../pages/admin/AdminContacts';
import UserGovtWebsites from '../pages/user/UserGovtWebsites';
import AdminGovtWebsites from '../pages/admin/AdminGovtWebsites';
import UserCommunityActivities from '../pages/user/UserCommunityActivities';
import AdminCommunityActivities from '../pages/admin/AdminCommunityActivities';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/user'} replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/user'} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes - Both User and Admin */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Protected User Routes */}
      <Route path="/user" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/create-complaint" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <CreateComplaint />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/my-complaints" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <MyComplaints />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/complaints/:id" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserComplaintDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/complaint/:id" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserComplaintDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/notices" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <Notices />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/poll" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserPoll />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/contacts" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserContacts />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/govt-websites" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserGovtWebsites />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/community-activities" element={
        <ProtectedRoute requiredRole="user">
          <Layout>
            <UserCommunityActivities />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AllComplaints />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/complaints/:id" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminComplaintDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/upload-notice" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <UploadNotice />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/poll" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminPoll />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/contacts" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminContacts />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/govt-websites" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminGovtWebsites />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/community-activities" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminCommunityActivities />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
