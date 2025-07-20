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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  // Debug logging for classes
  useEffect(() => {
    console.log('Sorted Classes:', sortedClasses);
  }, [sortedClasses]);

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

  return (
    <div className="timetable-section container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Weekly Class Schedule</h2>
          <p className="text-gray-600">View all our classes organized by day and time</p>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded mb-4 text-sm ${
          error.includes('successfully') 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Day-by-Day Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {days.map(day => {
          const dayClasses = groupedClasses[day];
          
          return (
            <div key={day} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-3">
                {day}
              </h3>
              
              {dayClasses && dayClasses.length > 0 ? (
                <div className="space-y-3">
                  {dayClasses.map(classItem => {
                    const isBooked = userBookings.some(booking => 
                      booking.classId === classItem.id && booking.status === 'confirmed'
                    );
                    
                    return (
                      <div
                        key={classItem.id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          isBooked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onMouseEnter={() => setHoveredClass(classItem.id)}
                        onMouseLeave={() => setHoveredClass(null)}
                      >
                        {/* Time and Class Type */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-bold text-lg text-gray-800">
                            {classItem.time}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getClassTypeColor(classItem.type)}`}>
                            {classItem.type.charAt(0).toUpperCase() + classItem.type.slice(1)}
                          </span>
                        </div>
                        
                        {/* Class Name */}
                        <h4 className="font-bold text-base text-gray-800 mb-2">
                          {classItem.name.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h4>
                        
                        {/* Instructor */}
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Instructor:</span> {classItem.instructor}
                        </div>

                        {/* Quick Info */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                          <span>Level: {classItem.level}</span>
                          <span>{classItem.duration} min</span>
                          <span>{classItem.spotsLeft}/{classItem.maxSpots} spots</span>
                        </div>

                        {/* Booking Button */}
                        {user && (
                          <button
                            onClick={() => isBooked ? handleCancelBooking(classItem.id) : handleBookClass(classItem.id)}
                            disabled={loading || (!isBooked && classItem.spotsLeft === 0)}
                            className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                              isBooked
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : classItem.spotsLeft === 0
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {loading ? 'Processing...' : 
                              isBooked ? 'Cancel Booking' : 
                              classItem.spotsLeft === 0 ? 'Class Full' : 'Book Class'
                            }
                          </button>
                        )}

                        {/* Hover details popup */}
                        {hoveredClass === classItem.id && (
                          <div className="absolute z-10 left-0 right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 text-sm">
                            <div className="space-y-2 mb-3">
                              <div><span className="font-semibold">Level:</span> {classItem.level}</div>
                              <div><span className="font-semibold">Duration:</span> {classItem.duration} minutes</div>
                              <div><span className="font-semibold">Available Spots:</span> {classItem.spotsLeft} out of {classItem.maxSpots}</div>
                              <div><span className="font-semibold">Instructor:</span> {classItem.instructor}</div>
                            </div>
                            
                            {!user && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                Please log in to book this class
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">No classes scheduled</div>
                  <div className="text-sm">Check back later for updates</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hall Hire Schedule */}
      <div className="mt-12">
        <HallHireSchedule />
      </div>
    </div>
  );
};

export default Timetable;