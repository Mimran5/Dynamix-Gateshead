import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClassesOverview from './components/ClassesOverview';
import Timetable from './components/Timetable';
import Instructors from './components/Instructors';
import Membership from './components/Membership';
import NewsUpdates from './components/NewsUpdates';
import Newsletter from './components/Newsletter';
import MemberAuth from './components/MemberAuth';
import MemberDashboard from './components/MemberDashboard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import HallHire from './components/HallHire';
import HallHirePreview from './components/HallHirePreview';
import { useAuth } from './context/AuthContext';
import ResetPassword from './components/ResetPassword';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/member', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BookingProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Hero />
                    <ClassesOverview />
                    <Timetable />
                    <Instructors />
                    <Membership />
                    <HallHirePreview />
                    <NewsUpdates />
                    <Newsletter />
                  </>
                } />
                <Route path="/classes" element={<ClassesOverview />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/instructors" element={<Instructors />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/hall-hire" element={<HallHire />} />
                <Route path="/cart" element={<Cart onClose={() => {}} />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Auth Routes */}
                <Route path="/member" element={<MemberAuth />} />
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <MemberDashboard />
                  </ProtectedRoute>
                } />

                {/* Reset Password Route */}
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </BookingProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;