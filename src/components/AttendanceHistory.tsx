import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../data/bookings';
import { classes } from '../data/classes';
import { Calendar, Check, X, Clock } from 'lucide-react';

const AttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', user.uid),
          orderBy('bookedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as Booking));
        setBookings(fetchedBookings);
      } catch (err) {
        setError('Failed to fetch attendance history');
        console.error('Error fetching attendance history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance history</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't attended any classes yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => {
            const classData = classes.find(c => c.id === booking.classId);
            return (
              <li key={booking.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {booking.attended ? (
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                      ) : booking.attendanceMarkedAt ? (
                        <X className="h-5 w-5 text-red-500 mr-2" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {classData?.name || 'Unknown Class'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.attended
                            ? 'bg-green-100 text-green-800'
                            : booking.attendanceMarkedAt
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.attended
                          ? 'Attended'
                          : booking.attendanceMarkedAt
                          ? 'No Show'
                          : 'Pending'}
                      </span>
                    </div>
                  </div>
                  {booking.attendanceNotes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Note: {booking.attendanceNotes}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AttendanceHistory; 