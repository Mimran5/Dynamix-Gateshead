import React from 'react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dynamix</h3>
            <p className="text-gray-300 mb-4">
              Where movement meets mindfulness. Join our community of dancers, yogis, and fitness enthusiasts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Classes</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Gymnastics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Yoga</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Pilates</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Kickboxing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Aerobics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Karate</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#timetable" className="text-gray-300 hover:text-teal-400 transition-colors">Timetable</a></li>
              <li><a href="#membership" className="text-gray-300 hover:text-teal-400 transition-colors">Membership</a></li>
              <li><a href="#instructors" className="text-gray-300 hover:text-teal-400 transition-colors">Instructors</a></li>
              <li><a href="#news" className="text-gray-300 hover:text-teal-400 transition-colors">News & Updates</a></li>
              <li><a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-teal-400" />
                <p className="text-gray-300">Dynamix, Unit 3 Gladstone Terrace, Gateshead, NE8 4DY</p>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2 text-teal-400" />
                <a href="tel:07831983731" className="text-gray-300 hover:text-teal-400 transition-colors">07831 983731</a>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-2 text-teal-400" />
                <a href="mailto:info@dynamixdga.com" className="text-gray-300 hover:text-teal-400 transition-colors">info@dynamixdga.com</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Dynamix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;