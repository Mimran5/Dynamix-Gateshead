import React from 'react';
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HallHirePreview: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hall Hire Available
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Perfect venue for your events, workshops, parties, and special occasions. 
            Simple hourly pricing - book only what you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
            <p className="text-gray-600">Central Gateshead location with easy access and parking</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfect Size</h3>
            <p className="text-gray-600">Ideal venue for events up to 30 people</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Pricing</h3>
            <p className="text-gray-600">£25 per hour - book only what you need</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Simple Hourly Pricing</h3>
              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-700 mb-2">£25</div>
                  <div className="text-lg text-gray-600">per hour</div>
                  <div className="text-sm text-gray-500 mt-2">Up to 30 people</div>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <span className="text-primary-700 font-semibold mr-3">•</span>
                  <span>Chairs and tables included</span>
                </li>
                <li className="flex items-center">
                  <span className="text-primary-700 font-semibold mr-3">•</span>
                  <span>Kitchen access available</span>
                </li>
                <li className="flex items-center">
                  <span className="text-primary-700 font-semibold mr-3">•</span>
                  <span>Flexible booking times</span>
                </li>
                <li className="flex items-center">
                  <span className="text-primary-700 font-semibold mr-3">•</span>
                  <span>Changing facilities</span>
                </li>
              </ul>
              <p className="text-gray-600 mb-6">
                Perfect for birthday parties, corporate events, workshops, meetings, 
                fitness classes, and special occasions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-700 text-white rounded-lg p-6 mb-6">
                <h4 className="text-xl font-bold mb-2">Ready to Book?</h4>
                <p className="mb-4">Contact us to discuss your requirements and secure your date</p>
                <div className="text-sm space-y-1">
                  <p>📞 0191 XXX XXXX</p>
                  <p>📧 info@dynamixdga.com</p>
                </div>
              </div>
              
              <Link
                to="/hall-hire"
                className="inline-flex items-center bg-primary-700 text-white px-6 py-3 rounded-md hover:bg-primary-800 transition-colors font-semibold"
              >
                Book Now - £25/hour
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HallHirePreview; 