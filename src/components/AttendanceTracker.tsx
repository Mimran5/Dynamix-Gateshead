import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Booking, ClassBooking } from '../data/bookings';
import { classes } from '../data/classes';
import { Clock, Users, Check, X, AlertCircle } from 'lucide-react';

interface AttendanceTrackerProps {
  classId: string;
  onClose: () => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ classId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('classId', '==', classId),
          where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => doc.data() as Booking);
        setBookings(fetchedBookings);

        // Initialize attendance state
        const initialAttendance: Record<string, boolean> = {};
        const initialNotes: Record<string, string> = {};
        fetchedBookings.forEach(booking => {
          initialAttendance[booking.userId] = booking.attended || false;
          initialNotes[booking.userId] = booking.attendanceNotes || '';
        });
        setAttendance(initialAttendance);
        setNotes(initialNotes);
      } catch (err) {
        setError('Failed to fetch bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [classId]);

  const handleAttendanceChange = (userId: string, attended: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [userId]: attended
    }));
  };

  const handleNotesChange = (userId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [userId]: note
    }));
  };

  const saveAttendance = async () => {
    if (!user) {
      setError('You must be logged in to mark attendance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const classData = classes.find(c => c.id === classId);
      if (!classData) {
        throw new Error('Class not found');
      }

      // Update each booking's attendance
      for (const booking of bookings) {
        await updateDoc(doc(db, 'bookings', booking.id), {
          attended: attendance[booking.userId],
          attendanceMarkedBy: user.uid,
          attendanceMarkedAt: new Date(),
          attendanceNotes: notes[booking.userId]
        });
      }

      // Update class attendance record
      const bookingRef = doc(db, 'classBookings', classId);
      const bookingSnap = await getDoc(bookingRef);
      
      if (bookingSnap.exists()) {
        const bookingData = bookingSnap.data() as ClassBooking;
        const attendees = Object.entries(attendance)
          .filter(([_, attended]) => attended)
          .map(([userId]) => userId);
        const noShows = Object.entries(attendance)
          .filter(([_, attended]) => !attended)
          .map(([userId]) => userId);

        await updateDoc(bookingRef, {
          attendance: [
            ...(bookingData.attendance || []),
            {
              date: new Date(),
              markedBy: user.uid,
              attendees,
              noShows
            }
          ]
        });
      }

      onClose();
    } catch (err) {
      setError('Failed to save attendance');
      console.error('Error saving attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAttendanceChange(booking.userId, true)}
                      className={`p-2 rounded-full ${
                        attendance[booking.userId]
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(booking.userId, false)}
                      className={`p-2 rounded-full ${
                        attendance[booking.userId] === false
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">User ID: {booking.userId}</p>
                    <p className="text-sm text-gray-500">
                      Booked on: {booking.bookedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={notes[booking.userId] || ''}
                    onChange={(e) => handleNotesChange(booking.userId, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveAttendance}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker; 