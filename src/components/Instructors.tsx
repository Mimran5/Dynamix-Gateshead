import React, { useState } from 'react';
import { instructors } from '../data/instructors';

const Instructors: React.FC = () => {
  const [activeInstructor, setActiveInstructor] = useState<string | null>(null);
  
  return (
    <section id="instructors" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Instructors</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our team of highly qualified instructors bring passion, expertise, and personalized attention to every class.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {instructors.map((instructor) => (
            <div 
              key={instructor.id}
              className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                activeInstructor === instructor.id 
                  ? 'ring-2 ring-teal-500 shadow-lg' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setActiveInstructor(
                activeInstructor === instructor.id ? null : instructor.id
              )}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                  <h3 className="text-xl font-bold">{instructor.name}</h3>
                  <p className="text-sm opacity-90">
                    {instructor.specialties.join(' • ')}
                  </p>
                </div>
              </div>
              
              {activeInstructor === instructor.id && (
                <div className="p-4 text-gray-700 animate-fadeIn">
                  <p className="text-sm">{instructor.bio}</p>
                </div>
              )}
              
              {activeInstructor !== instructor.id && (
                <div className="p-4 text-center">
                  <button 
                    className="text-teal-600 text-sm font-medium hover:text-teal-800 transition-colors"
                  >
                    View Bio
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instructors;