import React from 'react';
import { memberships } from '../data/memberships';
import { Check } from 'lucide-react';

const Membership: React.FC = () => {
  return (
    <section id="membership" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Membership Plans</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect membership plan to fit your lifestyle and wellness goals. 
            Join our community today and transform your fitness journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-xl overflow-hidden shadow-lg border transition-transform hover:-translate-y-1 hover:shadow-xl ${
                plan.isPopular ? 'border-teal-500' : 'border-gray-100'
              }`}
            >
              {plan.isPopular && (
                <div className="bg-teal-500 text-white text-sm font-bold py-1 text-center">
                  MOST POPULAR
                </div>
              )}
              
              {plan.savingsPercent && (
                <div className="bg-orange-500 text-white text-sm font-bold py-1 text-center">
                  SAVE {plan.savingsPercent}%
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={18} className="text-teal-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.isPopular 
                      ? 'bg-teal-600 text-white hover:bg-teal-700' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-gray-600">
          <p className="max-w-2xl mx-auto">
            All memberships include access to our online booking system and free wifi.
            Memberships can be paused once per year for up to 30 days. 
            <a href="#" className="text-teal-600 hover:text-teal-800 font-medium ml-1">
              View our complete terms and conditions.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Membership;