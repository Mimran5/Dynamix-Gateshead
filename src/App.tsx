import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClassesOverview from './components/ClassesOverview';
import Timetable from './components/Timetable';
import Instructors from './components/Instructors';
import Membership from './components/Membership';
import NewsUpdates from './components/NewsUpdates';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ClassesOverview />
      <Timetable />
      <Instructors />
      <Membership />
      <NewsUpdates />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;