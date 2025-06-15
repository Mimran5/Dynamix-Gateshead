import React, { useState, useEffect } from 'react';
import { classes, days, classTypes, Class, timeSlots } from '../data/classes';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Timetable: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [classAvailability, setClassAvailability] = useState<Record<string, { available: number; waitlisted: number }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
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
      const availability: Record<string, { available: number; waitlisted: number }> = {};
      for (const classItem of classes) {
        const result = await getClassAvailability(classItem.id);
        availability[classItem.id] = result;
      }
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
    return classType?.color || 'bg-gray-100';
  };

  const getClassStatusColor = (classId: string) => {
    const totalBookings = (classAvailability[classId]?.available || 0) + 
                         (classAvailability[classId]?.waitlisted || 0);
    
    if (totalBookings >= 5) {
      return 'border-green-500 bg-green-50'; // Confirmed class
    } else if (classAvailability[classId]?.available === 0) {
      return 'border-orange-500 bg-orange-50'; // Full class with waitlist
    } else {
      return 'border-blue-500 bg-blue-50'; // Available class
    }
  };

  const getClassByTimeAndDay = (time: string, day: string) => {
    return filteredClasses.find(c => c.time === time && c.day === day);
  };

  return (
    <section id="timetable" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Class Schedule</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and book your preferred classes. All classes are color-coded by type for easy identification.
          </p>
        </div>

        {/* Class Type Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-[1200px] bg-white">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {/* Time column */}
              <div className="col-span-1 bg-white">
                <div className="h-12"></div>
                <div className="space-y-px">
                  {timeSlots.map(time => (
                    <div key={time} className="h-16 flex items-center justify-end pr-4 text-sm text-gray-500 bg-white">
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div key={day} className="col-span-1">
                  <h3 className="h-12 flex items-center justify-center text-sm font-semibold text-gray-900 bg-white border-b border-gray-200">
                    {day}
                  </h3>
                  <div className="space-y-px">
                    {timeSlots.map(time => {
                      const classItem = getClassByTimeAndDay(time, day);
                      if (!classItem) {
                        return <div key={time} className="h-16 bg-white"></div>;
                      }

                      const totalBookings = (classAvailability[classItem.id]?.available || 0) + 
                                         (classAvailability[classItem.id]?.waitlisted || 0);
                      if (totalBookings < 5 && classAvailability[classItem.id]?.available === 0) {
                        return <div key={time} className="h-16 bg-white"></div>;
                      }

                      return (
                        <div
                          key={classItem.id}
                          className={`h-16 p-2 bg-white hover:bg-gray-50 transition-colors ${getClassTypeColor(classItem.type)}`}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900 text-xs">{classItem.name}</h4>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/80 text-gray-700">
                                {classItem.level}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              {classItem.instructor}
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="text-[10px] text-gray-600">
                                <span className="font-medium">{classAvailability[classItem.id]?.available || 0}</span> spots
                                {classAvailability[classItem.id]?.waitlisted > 0 && (
                                  <span className="ml-1 text-orange-600">
                                    ({classAvailability[classItem.id]?.waitlisted})
                                  </span>
                                )}
                              </div>
                              {user ? (
                                <button
                                  onClick={() => handleBooking(classItem.id)}
                                  disabled={loading[classItem.id] || !canBookOrCancel(classItem.id)}
                                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
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
                                  className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-900 text-white hover:bg-gray-800"
                                >
                                  Login
                                </button>
                              )}
                            </div>
                          </div>
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
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">Class Types</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {classTypes.map(type => (
                <div key={type.id} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getClassTypeColor(type.id)} mr-2`}></div>
                  <span className="text-xs text-gray-700">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Booking</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this class booking?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={() => handleCancel(showCancelConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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