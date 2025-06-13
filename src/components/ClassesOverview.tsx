import React from 'react';
import { classTypes } from '../data/classes';
import { ArrowRight } from 'lucide-react';

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
              className="bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="h-48 overflow-hidden relative bg-gray-100">
                <img
                  src={`/images/classes/optimized/${type.id.toLowerCase()}.png`}
                  alt={type.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/classes/optimized/default.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div 
                  className="absolute bottom-0 left-0 w-full p-4 text-white"
                  style={{ backgroundColor: `${type.color}20` }}
                >
                  <h3 className="text-2xl font-bold">{type.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{getDescriptionForType(type.id)}</p>
                <div className="flex items-center">
                  <a 
                    href="#timetable" 
                    className="text-teal-600 font-medium inline-flex items-center hover:text-teal-800 transition-colors"
                  >
                    View Schedule
                    <ArrowRight size={16} className="ml-1" />
                  </a>
                </div>
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
    default:
      return '';
  }
}

export default ClassesOverview;