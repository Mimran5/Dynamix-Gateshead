import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Home, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Cart from './Cart';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logo } from '../assets/images';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCart();
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isDashboard = location.pathname === '/dashboard';
  const isAuth = location.pathname === '/member';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Dynamix" 
                className="h-12 md:h-16 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement?.classList.add('text-2xl', 'font-bold', 'text-teal-600');
                  target.parentElement!.textContent = 'Dynamix';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isDashboard && (
              <>
                <Link to="/" className="text-gray-700 hover:text-teal-600 transition-colors">Home</Link>
                <Link to="/classes" className="text-gray-700 hover:text-teal-600 transition-colors">Classes</Link>
                <Link to="/timetable" className="text-gray-700 hover:text-teal-600 transition-colors">Timetable</Link>
                <Link to="/instructors" className="text-gray-700 hover:text-teal-600 transition-colors">Instructors</Link>
                <Link to="/membership" className="text-gray-700 hover:text-teal-600 transition-colors">Membership</Link>
              </>
            )}
            
            {/* Member Portal Navigation */}
            {isDashboard && (
              <>
                <Link to="/dashboard" className="text-teal-600 font-medium">My Portal</Link>
                <Link to="/dashboard/membership" className="text-gray-700 hover:text-teal-600 transition-colors">Membership</Link>
                <Link to="/dashboard/schedule" className="text-gray-700 hover:text-teal-600 transition-colors">Class Schedule</Link>
                <Link to="/dashboard/notifications" className="text-gray-700 hover:text-teal-600 transition-colors">Notifications</Link>
              </>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                {!isDashboard && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Member Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {!isAuth && (
                  <Link
                    to="/member"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Member Login
                  </Link>
                )}
                <button
                  onClick={toggleCart}
                  className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-teal-600 rounded-full">
                      {items.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors mr-2"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-teal-600 rounded-full">
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isDashboard ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link
                  to="/classes"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Classes
                </Link>
                <Link
                  to="/timetable"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Timetable
                </Link>
                <Link
                  to="/instructors"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Instructors
                </Link>
                <Link
                  to="/membership"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Membership
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-teal-600"
                  onClick={toggleMenu}
                >
                  My Portal
                </Link>
                <Link
                  to="/dashboard/membership"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Membership
                </Link>
                <Link
                  to="/dashboard/schedule"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Class Schedule
                </Link>
                <Link
                  to="/dashboard/notifications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Notifications
                </Link>
              </>
            )}
            {user ? (
              <>
                {!isDashboard && (
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                    onClick={toggleMenu}
                  >
                    Member Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              !isAuth && (
                <Link
                  to="/member"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Member Login
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && <Cart onClose={toggleCart} />}
    </nav>
  );
};

export default Navbar;