import React, { useState } from 'react';
import { classes, days, classTypes, Class } from '../data/classes';
import { Clock, Users } from 'lucide-react';

const Timetable: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  
  const filteredClasses = classes.filter(c => 
    selectedType === 'all' || c.type === selectedType
  );

  // Group classes by day
  const classesByDay = days.reduce((acc, day) => {
    acc[day] = filteredClasses.filter(c => c.day === day);
    return acc;
  }, {} as Record<string, Class[]>);

  return (
    <section id="timetable" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Weekly Class Schedule</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            View our complete weekly schedule. Filter by class type to find your perfect class.
          </p>
        </div>
        
        {/* Class Type Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class Type</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedType === 'all' 
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Classes
            </button>
            {classTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedType === type.id 
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedType === type.id ? undefined : { backgroundColor: `${type.color}15`, color: type.color }}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200">
            {days.map(day => (
              <div key={day} className="bg-white p-4">
                <h3 className="font-bold text-lg mb-4 text-gray-900">{day}</h3>
                <div className="space-y-4">
                  {classesByDay[day].length > 0 ? (
                    classesByDay[day].map(classItem => (
                      <ClassCard key={classItem.id} classItem={classItem} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No classes scheduled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ClassCardProps {
  classItem: Class;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem }) => {
  const classTypeObj = classTypes.find(t => t.id === classItem.type);
  const color = classTypeObj?.color || '#0D9488';
  
  return (
    <div 
      className="bg-white rounded-lg border p-3 hover:shadow-md transition-shadow"
      style={{ borderColor: `${color}40` }}
    >
      <div className="flex justify-between items-start mb-2">
        <span 
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {classTypeObj?.name}
        </span>
        <span className="text-sm font-medium text-gray-900">{classItem.time}</span>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-1">{classItem.name}</h4>
      
      <div className="flex items-center text-xs text-gray-500 space-x-2">
        <div className="flex items-center">
          <Clock size={12} className="mr-1" />
          <span>{classItem.duration} min</span>
        </div>
        <div className="flex items-center">
          <Users size={12} className="mr-1" />
          <span>Max {classItem.capacity}</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mt-2">
        <span className="font-medium">Instructor:</span> {classItem.instructor}
      </p>
    </div>
  );
};

export default Timetable;