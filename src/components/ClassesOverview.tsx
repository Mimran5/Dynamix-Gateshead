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
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={getImageForType(type.id)}
                  alt={type.name}
                  className="w-full h-full object-cover"
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

function getImageForType(type: string): string {
  switch (type) {
    case 'gymnastics':
      return 'https://images.pexels.com/photos/8171578/pexels-photo-8171578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'yoga':
      return 'https://images.pexels.com/photos/8436700/pexels-photo-8436700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'pilates':
      return 'https://images.pexels.com/photos/8171687/pexels-photo-8171687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'fitness':
      return 'https://images.pexels.com/photos/6456303/pexels-photo-6456303.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    default:
      return 'https://images.pexels.com/photos/8171578/pexels-photo-8171578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  }
}

function getDescriptionForType(type: string): string {
  switch (type) {
    case 'gymnastics':
      return 'Build strength, flexibility, and confidence through our progressive gymnastics programs for all ages.';
    case 'yoga':
      return 'Find balance and inner peace with our range of yoga classes designed for all experience levels.';
    case 'pilates':
      return 'Build core strength, improve posture, and enhance body awareness with our Pilates classes.';
    case 'fitness':
      return 'Challenge yourself with high-energy workouts designed to build strength and endurance.';
    default:
      return 'Join our expertly designed classes for a transformative movement experience.';
  }
}

export default ClassesOverview;