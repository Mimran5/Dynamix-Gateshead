import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MemberAuth: React.FC = () => {
  const { signup, login, user } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isSignup) {
      if (!name.trim() || !contact.trim()) {
        setError('Please enter your name and contact number.');
        setLoading(false);
        return;
      }
      const err = await signup(email, password, name, contact);
      setLoading(false);
      if (err) setError(err);
    } else {
      const err = await login(email, password);
      setLoading(false);
      if (err) setError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Member Login'}
        </h2>
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button className="text-teal-600 hover:underline" onClick={() => setIsSignup(false)}>
                Login
              </button>
            </span>
          ) : (
            <span>
              New here?{' '}
              <button className="text-teal-600 hover:underline" onClick={() => setIsSignup(true)}>
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