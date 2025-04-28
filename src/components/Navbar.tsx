import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-teal-600">
          Dynamix
        </a>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#classes" className="text-gray-700 hover:text-teal-600 transition-colors">Classes</a>
          <a href="#timetable" className="text-gray-700 hover:text-teal-600 transition-colors">Timetable</a>
          <a href="#instructors" className="text-gray-700 hover:text-teal-600 transition-colors">Instructors</a>
          <a href="#membership" className="text-gray-700 hover:text-teal-600 transition-colors">Membership</a>
          <a href="#news" className="text-gray-700 hover:text-teal-600 transition-colors">News</a>
        </nav>
        
        <a 
          href="#newsletter" 
          className="hidden md:block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
        >
          Sign Up
        </a>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#classes" 
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Classes
            </a>
            <a 
              href="#timetable" 
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Timetable
            </a>
            <a 
              href="#instructors" 
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Instructors
            </a>
            <a 
              href="#membership" 
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Membership
            </a>
            <a 
              href="#news" 
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </a>
            <a 
              href="#newsletter" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full transition-colors font-medium text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;