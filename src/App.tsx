import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
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
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/member" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
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
                  <NewsUpdates />
                  <Newsletter />
                </>
              } />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Auth Routes */}
              <Route path="/member" element={<MemberAuth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;