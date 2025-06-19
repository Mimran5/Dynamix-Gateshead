import React from 'react';
import { classTypes } from '../data/classes';
import { Link } from 'react-router-dom';

const ClassesOverview: React.FC = () => {
  return (
    <section id="classes" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Our Classes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From gymnastics to mindful movement, we offer a diverse range of classes to help you achieve your fitness and wellness goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classTypes.map((type) => (
            <div 
              key={type.id}
              className="relative overflow-hidden rounded-lg shadow-lg group"
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={`/images/classes/optimized/${type.id}.png`}
                  alt={type.name}
                  className="w-full h-full object-cover transform scale-110 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = '/images/classes/optimized/default.png';
                  }}
                />
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{type.name}</h3>
                <p className="text-white text-sm mb-4 drop-shadow-lg">{getDescriptionForType(type.id)}</p>
                <Link
                  to="/classes"
                  className="inline-flex items-center bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-primary-400 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  View Schedule
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function getDescriptionForType(type: string): string {
  switch (type) {
    case 'gymnastics':
      return 'Build strength, flexibility, and coordination through our expert-led gymnastics classes.';
    case 'yoga':
      return 'Find balance and inner peace with our diverse range of yoga practices.';
    case 'pilates':
      return 'Strengthen your core and improve posture with our Pilates sessions.';
    case 'dance':
      return 'Express yourself through movement with our dynamic dance classes.';
    case 'kickboxing':
      return 'Build strength and confidence with our high-energy kickboxing sessions.';
    case 'aerobics':
      return 'Get your heart pumping with our fun and energetic aerobics classes.';
    case 'karate':
      return 'Learn discipline and self-defense through traditional karate training.';
    case 'zumba':
      return 'Dance your way to fitness with our energetic Zumba classes combining Latin and international music.';
    default:
      return '';
  }
}

export default ClassesOverview;