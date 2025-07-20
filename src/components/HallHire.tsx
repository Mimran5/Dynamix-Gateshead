import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Check, Phone, Mail } from 'lucide-react';
import { hallHireRate, HallHireRate } from '../data/hallHire';
import HallBookingForm from './HallBookingForm';

const HallHire: React.FC = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Hall Hire
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Perfect venue for your events, workshops, parties, and special occasions
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Central Gateshead Location</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Up to 30 People</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>£25 per Hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
            <p className="text-gray-600">Conveniently located in central Gateshead with easy access and parking</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfect Size</h3>
            <p className="text-gray-600">Ideal venue for events up to 30 people with chairs and tables included</p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Pricing</h3>
            <p className="text-gray-600">£25 per hour - book only what you need with flexible booking times</p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Simple Hourly Pricing</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">{hallHireRate.name}</h3>
                <p className="text-gray-600 mb-6">{hallHireRate.description}</p>
                
                <div className="text-4xl font-bold text-primary-700 mb-2">
                  £{hallHireRate.pricePerHour}
                  <span className="text-lg text-gray-500 font-normal"> per hour</span>
                </div>
                
                <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
                  <Users className="w-4 h-4 mr-1" />
                  Up to {hallHireRate.capacity} people
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                  {hallHireRate.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full bg-primary-700 text-white py-3 px-6 rounded-md hover:bg-primary-800 transition-colors font-semibold text-lg"
                >
                  Book Now - £25/hour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* What's Included */}
          <div>
            <h3 className="text-2xl font-bold mb-6">What's Included</h3>
            <div className="space-y-4">
              {hallHireRate.includes.map((item, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Times */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Available Times</h3>
            <div className="space-y-3">
              {hallHireRate.availableTimes.map((time, index) => (
                <div key={index} className="flex items-center">
                  <Clock className="w-4 h-4 text-primary-700 mr-3" />
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6">Important Information</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-red-600">Restrictions</h4>
              <ul className="space-y-2">
                {hallHireRate.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-sm">{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-600">Additional Services</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-sm">Event planning consultation available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-primary-700 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Book Your Event?</h3>
          <p className="text-lg mb-6">Contact us for more information or to discuss your specific requirements</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>Call: 0191 XXX XXXX</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>Email: info@dynamixdga.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <HallBookingForm
          onClose={handleCloseBookingForm}
          hallHireRate={hallHireRate}
        />
      )}
    </div>
  );
};

export default HallHire; 