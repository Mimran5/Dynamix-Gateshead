import React, { useState, useEffect } from 'react';
import { classes, days, classTypes, Class, timeSlots } from '../data/classes';
import { Clock, Users, AlertCircle, Info, X } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Timetable: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [classAvailability, setClassAvailability] = useState<Record<string, { available: number; waitlisted: number }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  const { bookClass, cancelBooking, joinWaitlist, getClassAvailability } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const filteredClasses = selectedType
    ? classes.filter(c => c.type === selectedType)
    : classes;

  // Group classes by day
  const classesByDay = days.reduce((acc, day) => {
    acc[day] = filteredClasses.filter(c => c.day === day);
    return acc;
  }, {} as Record<string, Class[]>);

  useEffect(() => {
    const fetchAvailability = async () => {
      console.log('Fetching availability for classes:', classes);
      const availability: Record<string, { available: number; waitlisted: number }> = {};
      for (const classItem of classes) {
        const result = await getClassAvailability(classItem.id);
        console.log(`Availability for ${classItem.name}:`, result);
        availability[classItem.id] = result;
      }
      console.log('Final availability state:', availability);
      setClassAvailability(availability);
    };

    fetchAvailability();
  }, [getClassAvailability]);

  const canBookOrCancel = (classId: string) => {
    const now = new Date();
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return false;

    const classDate = new Date();
    const [hours, minutes] = classItem.time.split(':').map(Number);
    
    // Set the class date to the next occurrence of the class day
    const daysUntilClass = (days.indexOf(classItem.day) - classDate.getDay() + 7) % 7;
    classDate.setDate(classDate.getDate() + daysUntilClass);
    classDate.setHours(hours, minutes, 0, 0);

    // Check if class is more than 24 hours away
    const hoursUntilClass = (classDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass >= 24;
  };

  const isClassConfirmed = (classId: string) => {
    const totalBookings = (classAvailability[classId]?.available || 0) + 
                         (classAvailability[classId]?.waitlisted || 0);
    return totalBookings >= 5;
  };

  const handleBooking = async (classId: string) => {
    if (!user) {
      navigate('/member');
      return;
    }

    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;

    if (!canBookOrCancel(classId)) {
      setError('Bookings must be made at least 24 hours before the class');
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

  const handleCancel = async (classId: string) => {
    if (isClassConfirmed(classId)) {
      setError('This class is confirmed and cannot be cancelled as it would affect other attendees and the instructor');
      setShowCancelConfirm(null);
      return;
    }

    if (!canBookOrCancel(classId)) {
      setError('Cancellations must be made at least 24 hours before the class');
      setShowCancelConfirm(null);
      return;
    }

    setLoading(prev => ({ ...prev, [classId]: true }));
    setError(null);

    try {
      const result = await cancelBooking(classId);
      if (result.success) {
        const newAvailability = await getClassAvailability(classId);
        setClassAvailability(prev => ({
          ...prev,
          [classId]: newAvailability
        }));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred while cancelling the class');
    } finally {
      setLoading(prev => ({ ...prev, [classId]: false }));
      setShowCancelConfirm(null);
    }
  };

  const getClassTypeColor = (type: string) => {
    const classType = classTypes.find(t => t.id === type);
    switch (type) {
      case 'dance':
        return 'bg-teal-50 border-teal-500 hover:bg-teal-100';
      case 'yoga':
        return 'bg-purple-50 border-purple-500 hover:bg-purple-100';
      case 'pilates':
        return 'bg-orange-50 border-orange-500 hover:bg-orange-100';
      case 'gymnastics':
        return 'bg-blue-50 border-blue-500 hover:bg-blue-100';
      case 'kickboxing':
        return 'bg-red-50 border-red-500 hover:bg-red-100';
      case 'aerobics':
        return 'bg-pink-50 border-pink-500 hover:bg-pink-100';
      case 'karate':
        return 'bg-green-50 border-green-500 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-500 hover:bg-gray-100';
    }
  };

  const getAvailabilityText = (classId: string) => {
    const available = classAvailability[classId]?.available || 0;
    const waitlisted = classAvailability[classId]?.waitlisted || 0;

    if (available === 0 && waitlisted === 0) {
      return { text: 'Fully Booked', color: 'text-red-600' };
    } else if (available === 0) {
      return { text: `${waitlisted} on Waitlist`, color: 'text-orange-600' };
    } else {
      return { text: `${available} Spots Left`, color: 'text-green-600' };
    }
  };

  const getClassTooltip = (classItem: Class) => {
    const availability = getAvailabilityText(classItem.id);
    return (
      <div className="p-2 text-sm">
        <h4 className="font-medium text-gray-900">{classItem.name}</h4>
        <p className="text-gray-600">{classItem.instructor}</p>
        <p className="text-gray-600">Level: {classItem.level}</p>
        <p className="text-gray-600">Time: {classItem.time}</p>
        <p className={availability.color}>{availability.text}</p>
      </div>
    );
  };

  const getClassByTimeAndDay = (time: string, day: string) => {
    return filteredClasses.find(c => c.time === time && c.day === day);
  };

  return (
    <section id="timetable" className="py-4 bg-white">
      <div className="container mx-auto px-0">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Class Schedule</h2>
          <p className="text-sm text-gray-600">
            View and book your preferred classes. All classes are color-coded by type.
          </p>
        </div>

        {/* Fixed Class Type Filter */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-2 mb-2">
          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                !selectedType
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Classes
            </button>
            {classTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedType === type.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center text-sm">
            <AlertCircle className="mr-2" size={14} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-[900px] bg-white">
            <div className="grid grid-cols-7 gap-0">
              {/* Time column */}
              <div className="col-span-1 bg-white">
                <div className="h-8"></div>
                <div className="space-y-0">
                  {timeSlots.map(time => (
                    <div key={time} className="h-12 flex items-center justify-end pr-2 text-xs text-gray-500 bg-white">
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div key={day} className="col-span-1">
                  <h3 className="h-8 flex items-center justify-center text-xs font-semibold text-gray-900 bg-white border-b border-gray-200">
                    {day}
                  </h3>
                  <div className="space-y-0">
                    {timeSlots.map(time => {
                      const classItem = classes.find(c => c.time === time && c.day === day);
                      if (!classItem) {
                        return <div key={time} className="h-12 bg-white"></div>;
                      }

                      const isFiltered = selectedType && classItem.type !== selectedType;
                      const availability = getAvailabilityText(classItem.id);
                      
                      return (
                        <div
                          key={classItem.id}
                          className={`h-12 p-1 transition-all duration-200 relative ${
                            getClassTypeColor(classItem.type)
                          } ${isFiltered ? 'opacity-30' : 'opacity-100'}`}
                          onMouseEnter={() => setHoveredClass(classItem.id)}
                          onMouseLeave={() => setHoveredClass(null)}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0 pr-1">
                                <h4 className="font-medium text-gray-900 text-xs truncate" title={classItem.name}>
                                  {classItem.name}
                                </h4>
                                <div className="text-[10px] text-gray-600 truncate" title={classItem.instructor}>
                                  {classItem.instructor}
                                </div>
                              </div>
                              <span className="text-[10px] font-medium px-1 py-0.5 rounded-full bg-white text-gray-700 flex-shrink-0">
                                {classItem.level}
                              </span>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className={`text-[10px] ${availability.color} flex items-center truncate`}>
                                <Users size={10} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{availability.text}</span>
                              </div>
                              {user ? (
                                <button
                                  onClick={() => handleBooking(classItem.id)}
                                  disabled={loading[classItem.id] || !canBookOrCancel(classItem.id)}
                                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors flex-shrink-0 ${
                                    classAvailability[classItem.id]?.available > 0
                                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                                      : 'bg-orange-500 text-white hover:bg-orange-600'
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
                              ) : (
                                <button
                                  onClick={() => navigate('/member')}
                                  className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-900 text-white hover:bg-gray-800 flex-shrink-0"
                                >
                                  Login
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Tooltip */}
                          {hoveredClass === classItem.id && (
                            <div className="absolute z-20 left-full ml-2 top-0 bg-white rounded-lg shadow-lg border border-gray-200">
                              {getClassTooltip(classItem)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <div>
            <h4 className="text-xs font-medium text-gray-900 mb-1.5 text-center">Class Types</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {classTypes.map(type => (
                <div key={type.id} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getClassTypeColor(type.id)} mr-1`}></div>
                  <span className="text-xs text-gray-700">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">Cancel Booking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this class booking?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={() => handleCancel(showCancelConfirm)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Timetable;