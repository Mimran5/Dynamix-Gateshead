import React from 'react';
import { ArrowRight } from 'lucide-react';
import { heroImage } from '../assets/images';

const Hero: React.FC = () => {
  const scrollToClasses = () => {
    const classesSection = document.getElementById('classes');
    if (classesSection) {
      classesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url('${heroImage}')`,
          backgroundPosition: "center 30%"
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Move, <span className="text-teal-400">Transform</span>, Inspire
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Discover the perfect blend of gymnastics, yoga, pilates, and fitness classes for every body and skill level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#timetable" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full font-medium transition-colors inline-flex items-center justify-center"
            >
              View Schedule
              <ArrowRight size={18} className="ml-2" />
            </a>
            <a 
              href="#membership" 
              className="bg-transparent hover:bg-white/10 border-2 border-white text-white px-8 py-3 rounded-full font-medium transition-colors inline-flex items-center justify-center"
            >
              Join Now
            </a>
          </div>
        </div>
      </div>
      
      {/* Animated scroll indicator */}
      <button 
        onClick={scrollToClasses}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer hover:scale-110 transition-transform"
      >
        <div className="animate-bounce bg-white p-2 w-10 h-10 ring-1 ring-white/20 shadow-lg rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </button>
    </section>
  );
};

export default Hero;