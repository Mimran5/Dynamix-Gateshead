import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

const Timetable: React.FC = () => {
  const { classes, userBookings, bookClass, cancelBooking } = useBooking();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const filteredClasses = classes.filter(classItem => 
    selectedType === 'all' || classItem.type === selectedType
  );

  const timeSlots = [
    '17:00', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
    '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30',
    '20:45', '21:00', '21:15', '21:30', '21:45', '22:00'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate how many time slots a class spans based on its duration
  const getClassSpan = (duration: number) => {
    // Assuming each time slot is 15 minutes
    return Math.ceil(duration / 15);
  };

  // Convert time (HH:mm) to slot index
  const getTimeSlotIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const firstSlotMinutes = 17 * 60; // 17:00
    return Math.floor((totalMinutes - firstSlotMinutes) / 15);
  };

  // Group classes by day and calculate their positions
  const groupedClasses = days.reduce((acc, day) => {
    acc[day] = filteredClasses
      .filter(classItem => classItem.day === day)
      .map(classItem => ({
        ...classItem,
        slotIndex: getTimeSlotIndex(classItem.time),
        span: getClassSpan(classItem.duration)
      }));
    return acc;
  }, {} as Record<string, (typeof filteredClasses[0] & { slotIndex: number; span: number })[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Class Schedule</h2>
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            className={`px-4 py-2 rounded ${selectedType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedType('all')}
          >
            All Classes
          </button>
          {Array.from(new Set(classes.map(c => c.type))).map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time slots header */}
          <div className="grid grid-cols-[100px_repeat(20,minmax(100px,1fr))] gap-1 mb-2">
            <div className="font-semibold">Time</div>
            {timeSlots.map(time => (
              <div key={time} className="text-sm text-center font-medium">
                {time}
              </div>
            ))}
          </div>

          {/* Days and classes */}
          <div className="space-y-2">
            {days.map(day => (
              <div key={day} className="grid grid-cols-[100px_repeat(20,minmax(100px,1fr))] gap-1">
                <div className="font-semibold">{day}</div>
                <div className="col-span-20 relative h-20 bg-gray-50 rounded">
                  {groupedClasses[day]?.map(classItem => {
                    const isBooked = userBookings.some(booking => 
                      booking.classId === classItem.id && booking.status === 'confirmed'
                    );
                    
                    return (
                      <div
                        key={classItem.id}
                        className="absolute top-0 bottom-0 rounded shadow-sm p-2 text-sm overflow-hidden"
                        style={{
                          left: `${(classItem.slotIndex / 20) * 100}%`,
                          width: `${(classItem.span / 20) * 100}%`,
                          backgroundColor: isBooked ? '#93c5fd' : '#dbeafe',
                          borderLeft: '4px solid #2563eb'
                        }}
                      >
                        <div className="font-medium mb-1">{classItem.name}</div>
                        <div className="text-xs text-gray-600">
                          {classItem.time} ({classItem.duration}min)
                        </div>
                        {user && (
                          <button
                            onClick={() => isBooked ? handleCancelBooking(classItem.id) : handleBookClass(classItem.id)}
                            disabled={loading || (!isBooked && classItem.spotsLeft === 0)}
                            className={`mt-1 px-2 py-0.5 rounded text-xs ${
                              isBooked
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : classItem.spotsLeft === 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {isBooked ? 'Cancel' : classItem.spotsLeft === 0 ? 'Full' : 'Book'}
                          </button>
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
    </div>
  );
};

export default Timetable;