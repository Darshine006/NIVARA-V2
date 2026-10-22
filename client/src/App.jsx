import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import HealthInfoPage from './pages/HealthInfoPage';
import SymptomGuidancePage from './pages/SymptomGuidancePage';
import HealthcareDirectoryPage from './pages/HealthcareDirectoryPage';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerConsultationPage from './pages/WorkerConsultationPage';
import WorkerRegisterPatientPage from './pages/WorkerRegisterPatientPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <OfflineBanner />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/health-info" element={<HealthInfoPage />} />
          <Route path="/symptoms" element={<SymptomGuidancePage />} />
          <Route path="/centers" element={<HealthcareDirectoryPage />} />

          {/* Patient Protected Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute allowedRoles={['patient', 'healthcare_worker', 'admin']}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalRecordsPage />
              </ProtectedRoute>
            }
          />

          {/* Healthcare Worker Protected Routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['healthcare_worker', 'admin']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/consultation"
            element={
              <ProtectedRoute allowedRoles={['healthcare_worker', 'admin']}>
                <WorkerConsultationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/register-patient"
            element={
              <ProtectedRoute allowedRoles={['healthcare_worker', 'admin']}>
                <WorkerRegisterPatientPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
