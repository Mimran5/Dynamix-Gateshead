import React, { useState } from 'react';
import { classes, days, classTypes, Class } from '../data/classes';
import { Clock, Users } from 'lucide-react';

const Timetable: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedType, setSelectedType] = useState('all');
  
  const filteredClasses = classes.filter(c => 
    (selectedDay === 'all' || c.day === selectedDay) && 
    (selectedType === 'all' || c.type === selectedType)
  );
  
  const handleDayChange = (day: string) => {
    setSelectedDay(day);
  };
  
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  return (
    <section id="timetable" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Class Timetable</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find the perfect class to fit your schedule. Filter by day or class type to customize your view.
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    selectedDay === day 
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                onClick={() => handleTypeChange('all')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedType === 'all' 
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              {classTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
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
        </div>
        
        {/* Timetable Results */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(classItem => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">No classes found for the selected filters.</p>
            <button
              onClick={() => {
                setSelectedDay('all');
                setSelectedType('all');
              }}
              className="mt-4 text-teal-600 font-medium hover:text-teal-800 transition-colors"
            >
              View all classes
            </button>
          </div>
        )}
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
      className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 transition-transform hover:shadow-lg hover:-translate-y-1"
      style={{ borderColor: color }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span 
              className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2"
              style={{ backgroundColor: `${color}15`, color: color }}
            >
              {classTypeObj?.name}
            </span>
            <h3 className="text-xl font-bold">{classItem.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-gray-600 font-medium">{classItem.day}</p>
            <p className="text-gray-900 font-bold">{classItem.time}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{classItem.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{classItem.duration} min</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>Max {classItem.capacity}</span>
          </div>
          <div>
            <span className="font-medium" style={{ color }}>
              {classItem.level}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-700">
            <span className="font-medium">Instructor:</span> {classItem.instructor}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timetable;