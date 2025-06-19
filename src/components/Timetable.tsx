import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

const Timetable: React.FC = () => {
  const { classes, userBookings, bookClass, cancelBooking, loading: contextLoading, error: contextError } = useBooking();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('Timetable: Component state:', {
      classes,
      userBookings,
      selectedType,
      loading,
      error,
      contextLoading,
      contextError
    });
  }, [classes, userBookings, selectedType, loading, error, contextLoading, contextError]);

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

  // Filter classes based on selected type
  const filteredClasses = classes.filter(classItem => 
    selectedType === 'all' || classItem.type === selectedType
  ).sort((a, b) => {
    // Sort by day first, then by time
    const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayOrder !== 0) return dayOrder;
    return a.time.localeCompare(b.time);
  });

  // Group classes by day
  const groupedClasses = days.reduce((acc, day) => {
    acc[day] = filteredClasses.filter(classItem => classItem.day === day);
    return acc;
  }, {} as Record<string, typeof filteredClasses>);

  // Debug logging for filtered classes
  useEffect(() => {
    console.log('Filtered Classes:', filteredClasses);
  }, [filteredClasses]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Class Schedule</h2>
        
        {/* Filter buttons */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className={`px-4 py-2 rounded transition-colors ${
                selectedType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedType('all')}
            >
              All Classes
            </button>
            {Array.from(new Set(classes.map(c => c.type))).map(type => (
              <button
                key={type}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedType === type 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Class Schedule Display */}
      <div className="space-y-8">
        {days.map(day => {
          const dayClasses = groupedClasses[day];
          if (!dayClasses || dayClasses.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                {day}
              </h3>
              <div className="space-y-4">
                {dayClasses.map(classItem => {
                  const isBooked = userBookings.some(booking => 
                    booking.classId === classItem.id && booking.status === 'confirmed'
                  );
                  
                  return (
                    <div
                      key={classItem.id}
                      className={`border rounded-lg p-4 ${
                        isBooked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-800">{classItem.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isBooked 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {classItem.type}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-semibold">Time:</span> {classItem.time} ({classItem.duration} min)
                            </div>
                            <div>
                              <span className="font-semibold">Instructor:</span> {classItem.instructor}
                            </div>
                            <div>
                              <span className="font-semibold">Level:</span> {classItem.level}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="font-semibold">Available Spots:</span>
                            <span className={`ml-2 font-bold ${
                              classItem.spotsLeft === 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {classItem.spotsLeft} / {classItem.maxSpots}
                            </span>
                          </div>
                        </div>

                        {user && (
                          <div className="md:w-32">
                            <button
                              onClick={() => isBooked ? handleCancelBooking(classItem.id) : handleBookClass(classItem.id)}
                              disabled={loading || (!isBooked && classItem.spotsLeft === 0)}
                              className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                                isBooked
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : classItem.spotsLeft === 0
                                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              {loading ? 'Processing...' : 
                                isBooked ? 'Cancel' : 
                                classItem.spotsLeft === 0 ? 'Full' : 'Book'
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* No classes message */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No classes found for the selected filter.
          </div>
          <button
            onClick={() => setSelectedType('all')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Show All Classes
          </button>
        </div>
      )}
    </div>
  );
};

export default Timetable;