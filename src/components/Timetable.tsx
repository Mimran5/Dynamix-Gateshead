import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import HallHireSchedule from './HallHireSchedule';

const Timetable: React.FC = () => {
  const { classes, userBookings, bookClass, cancelBooking, loading: contextLoading, error: contextError } = useBooking();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Timetable: Component state:', {
      classes,
      userBookings,
      loading,
      error,
      contextLoading,
      contextError
    });
  }, [classes, userBookings, loading, error, contextLoading, contextError]);

  const handleBookClass = async (classId: string) => {
    if (!user) {
      setError('Please log in to book a class');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await bookClass(classId);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to book class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) {
      setError('Please log in to cancel a booking');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await cancelBooking(bookingId);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'];

  // Color coding for class types
  const getClassTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gymnastics':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'kickboxing':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'yoga':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pilates':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'aerobics':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'karate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'zumba':
        return 'bg-pink-100 border-pink-300 text-pink-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Helper function to convert time to minutes for easier comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to add minutes to time
  const addMinutesToTime = (time: string, minutes: number) => {
    const totalMinutes = timeToMinutes(time) + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Sort classes by day and time
  const sortedClasses = classes.sort((a, b) => {
    // Sort by day first, then by time
    const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.time.localeCompare(b.time);
  });

  // Group classes by day
  const groupedClasses = days.reduce((acc, day) => {
    acc[day] = sortedClasses.filter(classItem => classItem.day === day);
    return acc;
  }, {} as Record<string, typeof sortedClasses>);

  // Get all unique times and create time slots
  const getAllTimeSlots = () => {
    const allTimes = new Set<string>();
    
    // Add start times
    sortedClasses.forEach(c => allTimes.add(c.time));
    
    // Add end times
    sortedClasses.forEach(c => {
      const endTime = addMinutesToTime(c.time, c.duration);
      allTimes.add(endTime);
    });
    
    return Array.from(allTimes).sort();
  };

  // Check if a class occupies a specific time slot
  const getClassAtTimeSlot = (day: string, timeSlot: string) => {
    return groupedClasses[day]?.find(classItem => {
      const classStart = timeToMinutes(classItem.time);
      const classEnd = timeToMinutes(classItem.time) + classItem.duration;
      const slotTime = timeToMinutes(timeSlot);
      
      return slotTime >= classStart && slotTime < classEnd;
    });
  };

  // Debug logging for classes
  useEffect(() => {
    console.log('Sorted Classes:', sortedClasses);
    console.log('Grouped Classes:', groupedClasses);
  }, [sortedClasses, groupedClasses]);

  // Add loading state display
  if (contextLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Add error state display
  if (contextError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {contextError}
        </div>
      </div>
    );
  }

  const timeSlots = getAllTimeSlots();

  return (
    <div className="timetable-section container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Weekly Class Schedule</h2>
          <p className="text-gray-600 text-sm">Classes block out their full duration • Hover for details</p>
        </div>
      </div>

      {error && (
        <div className={`px-3 py-2 rounded mb-3 text-sm ${
          error.includes('successfully') 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Schedule Layout with Duration Blocking */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Schedule Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-1 p-2">
            <div className="font-bold text-gray-700 text-xs">Time</div>
            {days.map(day => (
              <div key={day} className="font-bold text-gray-700 text-center text-xs">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Body */}
        <div className="divide-y divide-gray-100">
          {timeSlots.map((timeSlot, index) => {
            const nextTimeSlot = timeSlots[index + 1];
            const isLastSlot = index === timeSlots.length - 1;
            
            return (
              <div key={timeSlot} className="grid grid-cols-6 gap-1 p-1 hover:bg-gray-50 transition-colors">
                {/* Time Column */}
                <div className="font-bold text-gray-800 text-xs flex items-center px-1">
                  {timeSlot}
                </div>
                
                {/* Day Columns */}
                {days.map(day => {
                  const classAtTime = getClassAtTimeSlot(day, timeSlot);
                  
                  if (!classAtTime) {
                    return (
                      <div key={day} className="text-center text-gray-200 text-xs py-1">
                        -
                      </div>
                    );
                  }

                  const isBooked = userBookings.some(booking => 
                    booking.classId === classAtTime.id && booking.status === 'confirmed'
                  );
                  const isClassStart = classAtTime.time === timeSlot;
                  const isLongClass = classAtTime.duration >= 45;

                  return (
                    <div key={day} className="relative">
                      <div
                        className={`border rounded p-1 cursor-pointer transition-all hover:shadow-sm ${
                          isLongClass ? 'min-h-[50px] bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' : 'min-h-[30px]'
                        } ${
                          isBooked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        } flex items-center justify-center`}
                        onMouseEnter={() => setHoveredClass(classAtTime.id)}
                        onMouseLeave={() => setHoveredClass(null)}
                      >
                        {/* Only show class name at the start of the class */}
                        {isClassStart && (
                          <div className={`text-xs font-medium text-gray-800 text-center leading-tight ${
                            isLongClass ? 'font-bold' : ''
                          }`}>
                            {classAtTime.name.split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                            {isLongClass && <span className="text-blue-600 ml-1">({classAtTime.duration}min)</span>}
                          </div>
                        )}

                        {/* Hover details popup */}
                        {hoveredClass === classAtTime.id && (
                          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-3 text-xs min-w-[250px]">
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getClassTypeColor(classAtTime.type)}`}>
                                  {classAtTime.type.charAt(0).toUpperCase() + classAtTime.type.slice(1)}
                                </span>
                                <span className="text-blue-600 font-medium text-xs bg-blue-100 px-2 py-1 rounded">{classAtTime.duration}min</span>
                                {isBooked && (
                                  <span className="text-blue-600 font-medium text-xs">✓ Booked</span>
                                )}
                              </div>
                              <div><span className="font-semibold">Class:</span> {classAtTime.name}</div>
                              <div><span className="font-semibold">Time:</span> {classAtTime.time} - {addMinutesToTime(classAtTime.time, classAtTime.duration)}</div>
                              <div><span className="font-semibold">Instructor:</span> {classAtTime.instructor}</div>
                              <div><span className="font-semibold">Level:</span> {classAtTime.level}</div>
                              <div><span className="font-semibold">Available:</span> {classAtTime.spotsLeft} out of {classAtTime.maxSpots}</div>
                            </div>
                            
                            {user && (
                              <button
                                onClick={() => isBooked ? handleCancelBooking(classAtTime.id) : handleBookClass(classAtTime.id)}
                                disabled={loading || (!isBooked && classAtTime.spotsLeft === 0)}
                                className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                                  isBooked
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : classAtTime.spotsLeft === 0
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                              >
                                {loading ? 'Processing...' : 
                                  isBooked ? 'Cancel Booking' : 
                                  classAtTime.spotsLeft === 0 ? 'Class Full' : 'Book Class'
                                }
                              </button>
                            )}
                            
                            {!user && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                Please log in to book this class
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* No classes message */}
      {sortedClasses.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-lg">
          <div className="text-gray-500 text-lg mb-2">No classes scheduled</div>
          <div className="text-gray-400 text-sm">Check back later for updates</div>
        </div>
      )}

      {/* Hall Hire Schedule */}
      <div className="mt-8">
        <HallHireSchedule />
      </div>
    </div>
  );
};

export default Timetable;