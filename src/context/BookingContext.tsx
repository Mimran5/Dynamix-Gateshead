import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  Class, 
  Booking, 
  subscribeToAllClasses, 
  createBooking, 
  cancelBooking as cancelBookingFn, 
  getUserBookings 
} from '../utils/firebase';

interface BookingContextType {
  classes: Class[];
  userBookings: Booking[];
  bookClass: (classId: string) => Promise<{ success: boolean; message: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  getClassAvailability: (classId: string) => Promise<{ available: number; waitlisted: number }>;
  loading: boolean;
  error: string | null;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Subscribe to all classes
  useEffect(() => {
    console.log('BookingContext: Setting up subscription to classes...');
    setLoading(true);
    
    const unsubscribe = subscribeToAllClasses((updatedClasses) => {
      console.log('BookingContext: Received updated classes:', updatedClasses);
      setClasses(updatedClasses);
      setLoading(false);
    });

    return () => {
      console.log('BookingContext: Cleaning up classes subscription');
      unsubscribe();
    };
  }, []);

  // Subscribe to user's bookings
  useEffect(() => {
    console.log('BookingContext: User auth state changed:', user?.uid);
    
    if (!user) {
      console.log('BookingContext: No user logged in, clearing bookings');
      setUserBookings([]);
      return;
    }

    console.log('BookingContext: Setting up subscription to user bookings...');
    const unsubscribe = getUserBookings(user.uid, (bookings) => {
      console.log('BookingContext: Received user bookings:', bookings);
      setUserBookings(bookings);
    });

    return () => {
      console.log('BookingContext: Cleaning up user bookings subscription');
      unsubscribe();
    };
  }, [user]);

  const bookClass = async (classId: string) => {
    console.log('BookingContext: Attempting to book class:', classId);
    setError(null);
    
    if (!user) {
      console.log('BookingContext: No user logged in, cannot book class');
      return { success: false, message: 'Please log in to book a class' };
    }

    try {
      const result = await createBooking(user.uid, classId);
      console.log('BookingContext: Booking result:', result);
      return result;
    } catch (err: any) {
      console.error('BookingContext: Error booking class:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    console.log('BookingContext: Attempting to cancel booking:', bookingId);
    setError(null);
    
    if (!user) {
      console.log('BookingContext: No user logged in, cannot cancel booking');
      return { success: false, message: 'Please log in to cancel a booking' };
    }

    try {
      const result = await cancelBookingFn(bookingId);
      console.log('BookingContext: Cancellation result:', result);
      return result;
    } catch (err: any) {
      console.error('BookingContext: Error cancelling booking:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const getClassAvailability = async (classId: string) => {
    console.log('BookingContext: Getting availability for class:', classId);
    
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) {
      console.log('BookingContext: Class not found');
      return { available: 0, waitlisted: 0 };
    }

    const result = {
      available: classItem.spotsLeft,
      waitlisted: 0 // You can implement waitlist functionality later
    };
    console.log('BookingContext: Class availability:', result);
    return result;
  };

  const contextValue = {
    classes,
    userBookings,
    bookClass,
    cancelBooking: handleCancelBooking,
    getClassAvailability,
    loading,
    error
  };

  console.log('BookingContext: Current state:', {
    classesCount: classes.length,
    userBookingsCount: userBookings.length,
    hasUser: !!user,
    loading,
    error
  });

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}; 