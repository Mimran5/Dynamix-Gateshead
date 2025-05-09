import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const MemberAuth: React.FC = () => {
  const { signup, login, user } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        if (!name.trim() || !contact.trim()) {
          setError('Please enter your name and contact number.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        
        const signupError = await signup(email, password, name, contact);
        if (signupError) {
          setError(signupError);
          setLoading(false);
          return;
        }

        setIsSignup(false);
        setPassword('');
        setConfirmPassword('');
        setName('');
        setContact('');
        setError('Account created successfully! Please login with your password.');
      } else {
        const loginError = await login(email, password);
        if (loginError) {
          setError(loginError);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('This email is not registered. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
        setIsSignup(false);
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('Password reset link has been sent to your email.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('This email is not registered. Please sign up first.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: 'signup' | 'login') => {
    setIsSignup(mode === 'signup');
    setError('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setContact('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignup ? 'Join Dynamix Gateshead' : 'Welcome back'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={isSignup}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  required={isSignup}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignup && (
            <div>
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required={isSignup}
              />
            </div>
          )}
          {error && (
            <div className={`text-sm p-3 rounded-lg border ${
              error.includes('successfully') || error.includes('reset link')
                ? 'text-green-600 bg-green-50 border-green-200' 
                : 'text-red-600 bg-red-50 border-red-200'
            }`}>
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
          {!isSignup && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-teal-600 hover:text-teal-700 text-sm font-medium mt-2"
              disabled={loading}
            >
              Forgot your password?
            </button>
          )}
        </form>
        <div className="text-center mt-4">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button 
                className="text-teal-600 hover:underline" 
                onClick={() => switchMode('login')}
              >
                Login
              </button>
            </span>
          ) : (
            <span>
              New here?{' '}
              <button 
                className="text-teal-600 hover:underline" 
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberAuth; 