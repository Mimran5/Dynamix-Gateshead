import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Check, Star, Phone, Mail } from 'lucide-react';
import { hallHirePackages, HallHirePackage } from '../data/hallHire';
import HallBookingForm from './HallBookingForm';

const HallHire: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<HallHirePackage | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleBookNow = (pkg: HallHirePackage) => {
    setSelectedPackage(pkg);
    setShowBookingForm(true);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedPackage(null);
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
                <span>Flexible Booking Times</span>
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
              <h3 className="text-xl font-semibold mb-2">Simple Setup</h3>
              <p className="text-gray-600">Chairs and tables included, kitchen access, and flexible booking times</p>
            </div>
        </div>

        {/* Packages Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Hall Hire Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hallHirePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  pkg.isPopular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {pkg.isPopular && (
                  <div className="bg-primary-500 text-white text-center py-2 text-sm font-semibold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  <div className="text-3xl font-bold text-primary-700 mb-2">
                    £{pkg.price}
                    <span className="text-sm text-gray-500 font-normal">/{pkg.duration}</span>
                  </div>
                  {pkg.id === 'hourly' && (
                    <div className="text-sm text-gray-600 mb-2">
                      £25 per hour
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    Up to {pkg.capacity} people
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleBookNow(pkg)}
                    className="w-full bg-primary-700 text-white py-2 px-4 rounded-md hover:bg-primary-800 transition-colors font-semibold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* What's Included */}
          <div>
            <h3 className="text-2xl font-bold mb-6">What's Included</h3>
            <div className="space-y-4">
              {hallHirePackages[1].includes.map((item, index) => (
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
              {hallHirePackages[0].availableTimes.map((time, index) => (
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
                {hallHirePackages[0].restrictions.map((restriction, index) => (
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
      {showBookingForm && selectedPackage && (
        <HallBookingForm
          selectedPackage={selectedPackage}
          onClose={handleCloseBookingForm}
        />
      )}
    </div>
  );
};

export default HallHire; 