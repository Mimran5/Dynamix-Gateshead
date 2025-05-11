import React, { useState, useEffect } from 'react';
import { classes, days, classTypes, Class, timeSlots } from '../data/classes';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

const Timetable: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [classAvailability, setClassAvailability] = useState<Record<string, { available: number; waitlisted: number }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { bookClass, joinWaitlist, getClassAvailability } = useBooking();
  const { user } = useAuth();

  const filteredClasses = classes.filter(c => 
    selectedType === 'all' || c.type === selectedType
  );

  // Create a grid of classes
  const timetableGrid = timeSlots.map(time => {
    const row: Record<string, Class | null> = {};
    days.forEach(day => {
      const classAtTime = filteredClasses.find(c => c.day === day && c.time === time);
      row[day] = classAtTime || null;
    });
    return { time, classes: row };
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      const availability: Record<string, { available: number; waitlisted: number }> = {};
      for (const classItem of classes) {
        const result = await getClassAvailability(classItem.id);
        availability[classItem.id] = result;
      }
      setClassAvailability(availability);
    };

    fetchAvailability();
  }, [getClassAvailability]);

  const handleBooking = async (classId: string) => {
    if (!user) {
      setError('Please log in to book a class');
      return;
    }

    setLoading(prev => ({ ...prev, [classId]: true }));
    setError(null);

    try {
      const result = await bookClass(classId);
      if (!result.success && result.message.includes('waitlist')) {
        const joinResult = await joinWaitlist(classId);
        if (joinResult.success) {
          setError('Class is full. You have been added to the waitlist.');
        } else {
          setError(joinResult.message);
        }
      } else if (!result.success) {
        setError(result.message);
      } else {
        const newAvailability = await getClassAvailability(classId);
        setClassAvailability(prev => ({
          ...prev,
          [classId]: newAvailability
        }));
      }
    } catch (err) {
      setError('An error occurred while booking the class');
    } finally {
      setLoading(prev => ({ ...prev, [classId]: false }));
    }
  };

  const getClassTypeColor = (type: string) => {
    const classType = classTypes.find(t => t.id === type);
    return classType?.color || 'bg-gray-100';
  };

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
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full ${
              selectedType === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Classes
          </button>
          {classTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full ${
                selectedType === type.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="grid grid-cols-6 border-b">
              <div className="p-4 font-semibold text-gray-500">Time</div>
              {days.map(day => (
                <div key={day} className="p-4 font-semibold text-gray-500 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            {timetableGrid.map(({ time, classes: dayClasses }) => (
              <div key={time} className="grid grid-cols-6 border-b last:border-b-0">
                <div className="p-4 text-sm text-gray-500 border-r">
                  {time}
                </div>
                {days.map(day => {
                  const classItem = dayClasses[day];
                  return (
                    <div key={`${time}-${day}`} className="p-2 border-r last:border-r-0">
                      {classItem ? (
                        <div className={`p-3 rounded-lg ${getClassTypeColor(classItem.type)}`}>
                          <h4 className="font-medium text-sm mb-1">{classItem.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{classItem.instructor}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {classAvailability[classItem.id]?.available || 0} spots
                            </span>
                            <button
                              onClick={() => handleBooking(classItem.id)}
                              disabled={loading[classItem.id]}
                              className={`px-2 py-1 text-xs rounded-full ${
                                classAvailability[classItem.id]?.available > 0
                                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                                  : 'bg-orange-600 text-white hover:bg-orange-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {loading[classItem.id] ? (
                                '...'
                              ) : classAvailability[classItem.id]?.available > 0 ? (
                                'Book'
                              ) : (
                                'Waitlist'
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[100px]"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {classTypes.map(type => (
            <div key={type.id} className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${getClassTypeColor(type.id)} mr-2`}></div>
              <span className="text-sm text-gray-600">{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timetable;