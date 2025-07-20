import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Sayfalar
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FortuneTellers from './pages/FortuneTellers';
import AddFortuneTeller from './pages/AddFortuneTeller';
import EditFortuneTeller from './pages/EditFortuneTeller';
import Stories from './pages/Stories';
import AddStory from './pages/AddStory';
import EditStory from './pages/EditStory';
import StoryStatistics from './pages/StoryStatistics';
import Users from './pages/Users';
import Fortunes from './pages/Fortunes';

// Layout
import AdminLayout from './components/AdminLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#0A0A1A' }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#0A0A1A' }}>
        <div className="text-center text-light">
          <h3>Erişim Reddedildi</h3>
          <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/fortune-tellers" element={
              <ProtectedRoute>
                <FortuneTellers />
              </ProtectedRoute>
            } />
            <Route path="/fortune-tellers/add" element={
              <ProtectedRoute>
                <AddFortuneTeller />
              </ProtectedRoute>
            } />
            <Route path="/fortune-tellers/edit/:id" element={
              <ProtectedRoute>
                <EditFortuneTeller />
              </ProtectedRoute>
            } />
            <Route path="/stories" element={
              <ProtectedRoute>
                <Stories />
              </ProtectedRoute>
            } />
            <Route path="/stories/add" element={
              <ProtectedRoute>
                <AddStory />
              </ProtectedRoute>
            } />
            <Route path="/stories/edit/:id" element={
              <ProtectedRoute>
                <EditStory />
              </ProtectedRoute>
            } />
            <Route path="/stories/statistics" element={
              <ProtectedRoute>
                <StoryStatistics />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/fortunes" element={
              <ProtectedRoute>
                <Fortunes />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
