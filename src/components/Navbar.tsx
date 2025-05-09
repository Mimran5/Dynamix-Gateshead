import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
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

  // Close cart when navigating to /checkout
  React.useEffect(() => {
    if (location.pathname === '/checkout' && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [location.pathname, isCartOpen]);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-teal-600">
            Dynamix
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#timetable" className="text-gray-700 hover:text-teal-600 transition-colors">Timetable</a>
            <a href="#membership" className="text-gray-700 hover:text-teal-600 transition-colors">Membership</a>
            <a href="#instructors" className="text-gray-700 hover:text-teal-600 transition-colors">Instructors</a>
            <a href="#news" className="text-gray-700 hover:text-teal-600 transition-colors">News</a>
            <a href="/member" className="text-teal-600 font-semibold hover:underline">Member Portal</a>
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-teal-600 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-4">
            <a href="#timetable" className="block text-gray-700 hover:text-teal-600 transition-colors">Timetable</a>
            <a href="#membership" className="block text-gray-700 hover:text-teal-600 transition-colors">Membership</a>
            <a href="#instructors" className="block text-gray-700 hover:text-teal-600 transition-colors">Instructors</a>
            <a href="#news" className="block text-gray-700 hover:text-teal-600 transition-colors">News</a>
            <a href="/member" className="block text-teal-600 font-semibold hover:underline">Member Portal</a>
            <button
              onClick={toggleCart}
              className="flex items-center text-gray-700 hover:text-teal-600 transition-colors"
            >
              <ShoppingCart size={24} className="mr-2" />
              Cart ({items.length})
            </button>
          </nav>
        )}
      </div>

      {/* Cart Dropdown */}
      {isCartOpen && <Cart />}
    </header>
  );
};

export default Navbar;