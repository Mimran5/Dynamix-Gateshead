import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClassesOverview from './components/ClassesOverview';
import Timetable from './components/Timetable';
import Instructors from './components/Instructors';
import Membership from './components/Membership';
import NewsUpdates from './components/NewsUpdates';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Checkout from './components/Checkout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import MemberAuth from './components/MemberAuth';
import MemberDashboard from './components/MemberDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-white">
            <Navbar />
            <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8">
              <Link to="/member" className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition-colors font-semibold">Member Portal</Link>
            </div>
            <Routes>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/member" element={<MemberAuth />} />
              <Route path="/dashboard" element={<MemberDashboard />} />
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
            </Routes>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;