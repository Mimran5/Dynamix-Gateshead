import React, { useState, useEffect } from 'react';
import { memberships } from '../data/memberships';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import StripeProvider from './StripeProvider';
import { useAuth } from '../context/AuthContext';
import { createCustomer, createSubscription } from '../services/subscriptionService';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Membership: React.FC = () => {
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [userMembership, setUserMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMembership = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserMembership(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user membership:', error);
        }
      }
      setLoading(false);
    };

    fetchUserMembership();
  }, [user]);

  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    setClientSecret(null);
    if (selectedMembership) {
      const membership = memberships.find(m => m.id === selectedMembership);
      if (membership) {
        addToCart(membership);
      }
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setClientSecret(null);
  };

  const handleMembershipSelect = async (membershipId: string) => {
    if (!user) {
      navigate('/member');
      return;
    }

    setProcessing(true);
    setSelectedMembership(membershipId);
    setPaymentSuccess(false);
    setPaymentError(null);
    setClientSecret(null);

    try {
      const { customerId } = await createCustomer(user.email || '', user.email?.split('@')[0] || '');
      const priceId = getPriceIdForMembership(membershipId);
      const { clientSecret: secret } = await createSubscription(customerId, priceId);
      setClientSecret(secret);
      setShowPaymentForm(true);
    } catch (error: any) {
      setPaymentError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getPriceIdForMembership = (membershipId: string): string => {
    const priceMap: { [key: string]: string } = {
      'basic': 'price_1QxYtXKZvIloP2hXKZvIloP2',
      'standard': 'price_1QxYtXKZvIloP2hXKZvIloP3',
      'family': 'price_1QxYtXKZvIloP2hXKZvIloP4'
    };
    return priceMap[membershipId] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <section id="membership" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Class Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Skip the drop-in fee and save with our flexible monthly packages!
          </p>
          <p className="text-lg text-gray-500 mt-2">
            All packages include full access to listed class types and use of our online booking system and account management.
          </p>
        </div>

        {showPaymentForm && selectedMembership && clientSecret && (
          <div className="max-w-md mx-auto mb-8">
            <StripeProvider
              amount={(memberships.find(m => m.id === selectedMembership)?.price || 0) * 100}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              clientSecret={clientSecret}
            />
            {paymentError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {paymentError}
              </div>
            )}
          </div>
        )}

        {paymentSuccess && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Payment successful! Your membership has been activated.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map((membership) => {
            const cartItem = items.find(item => item.membership.id === membership.id);
            const isCurrentMembership = userMembership?.membershipType === membership.id;
            
            return (
              <div 
                key={membership.id}
                className={`bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 ${
                  membership.isPopular ? 'ring-2 ring-primary-500' : ''
                } ${isCurrentMembership ? 'border-2 border-primary-500' : ''}`}
              >
                {membership.isPopular && (
                  <div className="bg-primary-500 text-white text-center py-2 font-medium">
                    Most Popular
                  </div>
                )}
                {isCurrentMembership && (
                  <div className="bg-primary-100 text-primary-800 text-center py-2 font-medium">
                    Current Plan
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{membership.name}</h3>
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    £{membership.price}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    £{membership.costPerClass} per class (Save £{membership.savings}/month)
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-4">
                    {membership.usage}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {membership.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    {cartItem ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(membership.id, cartItem.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(membership.id, cartItem.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(membership.id)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMembershipSelect(membership.id)}
                        className={`w-full ${
                          isCurrentMembership
                            ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        } py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
                      >
                        <CreditCard size={16} className="mr-2" />
                        {!user ? 'Sign in to Purchase' : 
                          !userMembership ? 'Get Started' :
                          isCurrentMembership ? 'Current Plan' : 
                          membership.price > (memberships.find(m => m.id === userMembership.membershipType)?.price || 0) ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-6">Compare & Save</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Savings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map((membership) => (
                    <tr key={membership.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{membership.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{membership.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membership.features[0].split(' ')[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{membership.costPerClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{membership.savings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membership.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
          <div className="space-y-2 text-gray-600">
            <p>Dynamix, Unit 3 Gladstone Terrace, Gateshead, NE8 4DY</p>
            <p>Email: <a href="mailto:info@dynamixdga.com" className="text-primary-600 hover:text-primary-800">info@dynamixdga.com</a></p>
            <p>Phone: <a href="tel:07831983731" className="text-primary-600 hover:text-primary-800">07831 983731</a></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Membership;