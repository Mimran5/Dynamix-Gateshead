import React, { useState, useEffect } from 'react';
import { classes, days, classTypes, Class } from '../data/classes';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Timetable: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [classAvailability, setClassAvailability] = useState<Record<string, { available: number; waitlisted: number }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const { bookClass, cancelBooking, joinWaitlist, getClassAvailability } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const filteredClasses = classes.filter(c => 
    selectedType === 'all' || c.type === selectedType
  );

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

  const canBookOrCancel = (classItem: Class) => {
    const now = new Date();
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

  const handleBooking = async (classId: string) => {
    if (!user) {
      navigate('/member');
      return;
    }

    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;

    if (!canBookOrCancel(classItem)) {
      setError('Bookings must be made at least 24 hours before the class');
      return;
    }

    const currentBookings = classAvailability[classId]?.available || 0;
    if (currentBookings < 5) {
      setError('This class requires a minimum of 5 attendees to run');
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
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;

    if (!canBookOrCancel(classItem)) {
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

  return (
    <section id="timetable" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Class Timetable</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book your classes online and manage your schedule with ease.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full ${
                selectedType === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Classes
            </button>
            {classTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-full ${
                  selectedType === type.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-7 gap-4">
              {days.map((day) => (
                <div key={day} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-bold mb-4 text-center">{day}</h3>
                  <div className="space-y-3">
                    {classesByDay[day].map((classItem) => (
                      <div
                        key={classItem.id}
                        className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${getClassTypeColor(classItem.type)}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm text-gray-900">{classItem.name}</h4>
                          <span className="text-xs text-gray-500">{classItem.level}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-xs mb-1">
                          <Clock size={14} className="mr-1" />
                          {classItem.time} ({classItem.duration} mins)
                        </div>
                        <div className="flex items-center text-gray-600 text-xs mb-2">
                          <Users size={14} className="mr-1" />
                          {classItem.instructor}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            {classAvailability[classItem.id]?.available || 0} spots
                            {classAvailability[classItem.id]?.waitlisted > 0 && (
                              <span className="ml-1 text-orange-600">
                                ({classAvailability[classItem.id]?.waitlisted})
                              </span>
                            )}
                          </div>
                          {user ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleBooking(classItem.id)}
                                disabled={loading[classItem.id] || !canBookOrCancel(classItem)}
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
                              {classAvailability[classItem.id]?.available === 0 && (
                                <button
                                  onClick={() => setShowCancelConfirm(classItem.id)}
                                  disabled={loading[classItem.id] || !canBookOrCancel(classItem)}
                                  className="px-2 py-1 text-xs rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => navigate('/member')}
                              className="px-2 py-1 text-xs rounded-full bg-teal-600 text-white hover:bg-teal-700"
                            >
                              Login to Book
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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