import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { classes } from '../data/classes';
import { Booking } from '../data/bookings';
import { Calendar, Users, Check, X, AlertCircle } from 'lucide-react';

const AdminAttendance: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedClass) {
      fetchBookings();
    }
  }, [selectedClass, selectedDate]);

  const fetchBookings = async () => {
    if (!selectedClass) return;

    setLoading(true);
    setError(null);

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('classId', '==', selectedClass),
        where('status', '==', 'confirmed')
      );

      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Booking));

      // Filter bookings for the selected date
      const dateBookings = fetchedBookings.filter(booking => {
        const bookingDate = new Date(booking.bookedAt);
        return (
          bookingDate.getDate() === selectedDate.getDate() &&
          bookingDate.getMonth() === selectedDate.getMonth() &&
          bookingDate.getFullYear() === selectedDate.getFullYear()
        );
      });

      setBookings(dateBookings);

      // Initialize attendance state
      const initialAttendance: Record<string, boolean> = {};
      const initialNotes: Record<string, string> = {};
      dateBookings.forEach(booking => {
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
    if (!user || !selectedClass) {
      setError('You must be logged in and select a class to mark attendance');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
      const bookingRef = doc(db, 'classBookings', selectedClass);
      const bookingSnap = await getDoc(bookingRef);
      
      if (bookingSnap.exists()) {
        const bookingData = bookingSnap.data();
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
              date: selectedDate,
              markedBy: user.uid,
              attendees,
              noShows
            }
          ]
        });
      }

      // Reset form
      setSelectedClass(null);
      setBookings([]);
      setAttendance({});
      setNotes({});
    } catch (err) {
      setError('Failed to save attendance');
      console.error('Error saving attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Class Attendance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">Select a class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({classItem.day} at {classItem.time})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : selectedClass && bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Bookings for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <span className="text-sm text-gray-500">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
              </span>
            </div>
            
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
                          Booked on: {new Date(booking.bookedAt).toLocaleDateString()}
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
                onClick={() => {
                  setSelectedClass(null);
                  setBookings([]);
                  setAttendance({});
                  setNotes({});
                }}
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
        ) : selectedClass ? (
          <div className="text-center p-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no bookings for this class on the selected date.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAttendance; 