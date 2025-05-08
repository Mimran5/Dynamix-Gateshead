import React from 'react';
import { memberships } from '../data/memberships';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const Membership: React.FC = () => {
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();

  return (
    <section id="membership" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Membership Options</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect membership package for your fitness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map((membership) => {
            const cartItem = items.find(item => item.membership.id === membership.id);
            
            return (
              <div 
                key={membership.id}
                className={`bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 ${
                  membership.isPopular ? 'ring-2 ring-teal-500' : ''
                }`}
              >
                {membership.isPopular && (
                  <div className="bg-teal-500 text-white text-center py-2 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{membership.name}</h3>
                  <div className="text-3xl font-bold text-teal-600 mb-4">
                    £{membership.price}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {membership.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        onClick={() => addToCart(membership)}
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Information */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
          <div className="space-y-2 text-gray-600">
            <p>Dynamix, Unit 3 Gladstone Terrace, Gateshead, NE8 4DY</p>
            <p>Email: <a href="mailto:info@dynamixdga.com" className="text-teal-600 hover:text-teal-800">info@dynamixdga.com</a></p>
            <p>Phone: <a href="tel:07831983731" className="text-teal-600 hover:text-teal-800">07831 983731</a></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Membership;