import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      // Reset form after successful submission
      setEmail('');
      setName('');
    }, 500);
  };
  
  return (
    <section id="newsletter" className="py-20 bg-primary-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Stay Updated
              </h2>
              <p className="text-xl text-primary-100 mb-6">
                Subscribe to our newsletter to receive the latest news, class updates, and special offers directly to your inbox.
              </p>
              <div className="flex items-start mb-8">
                <Mail size={24} className="text-primary-300 mr-4 mt-1" />
                <div>
                  <h3 className="text-white font-bold text-lg">What you'll receive:</h3>
                  <ul className="text-primary-100 space-y-2 mt-2">
                    <li>• Monthly schedule updates</li>
                    <li>• Exclusive promotions and discounts</li>
                    <li>• New class announcements</li>
                    <li>• Fitness tips and wellness content</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <CheckCircle size={48} className="text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    You've successfully subscribed to our newsletter. 
                    Check your inbox soon for updates!
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6">Join Our Community</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
                    >
                      Subscribe Now
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                    
                    <p className="mt-4 text-xs text-gray-500 text-center">
                      By subscribing, you agree to receive our newsletter and accept our{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-800">Privacy Policy</a>.
                      We respect your privacy and will never share your information.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;