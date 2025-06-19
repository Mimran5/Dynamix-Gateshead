import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT6djoaILfK_6cXVw3IGkE1QPI0aUccB0",
  authDomain: "dynamix-1decd.firebaseapp.com",
  projectId: "dynamix-1decd",
  storageBucket: "dynamix-1decd.appspot.com",
  messagingSenderId: "675780760207",
  appId: "1:675780760207:web:f12649d4d5745e36c896fa"
};

console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export const db = getFirestore(app);
export const auth = getAuth(app);

// Types
export interface Class {
  id: string;
  name: string;
  type: string;
  day: string;
  time: string;
  duration: number; // Duration in minutes
  maxSpots: number;
  spotsLeft: number;
  instructor: string;
  level: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: 'confirmed' | 'cancelled';
  bookedAt: Date;
  attended?: boolean;
}

// Class Management Functions
export const initializeClasses = async (classes: Class[]) => {
  for (const classItem of classes) {
    const classRef = doc(db, 'classes', classItem.id);
    await setDoc(classRef, {
      ...classItem,
      maxSpots: 20, // Default max spots
      spotsLeft: 20, // Initially all spots are available
    });
  }
};

export const getClass = async (classId: string): Promise<Class | null> => {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  return classSnap.exists() ? (classSnap.data() as Class) : null;
};

export const subscribeToClass = (classId: string, callback: (classData: Class | null) => void) => {
  const classRef = doc(db, 'classes', classId);
  return onSnapshot(classRef, (doc) => {
    callback(doc.exists() ? (doc.data() as Class) : null);
  });
};

export const subscribeToAllClasses = (callback: (classes: Class[]) => void) => {
  console.log('Setting up subscription to all classes');
  const classesRef = collection(db, 'classes');
  
  try {
    return onSnapshot(classesRef, (snapshot) => {
      const classes: Class[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Class);
      });
      console.log('Received classes from Firestore:', classes);
      callback(classes);
    }, (error) => {
      console.error('Error in classes subscription:', error);
      // You might want to handle this error in your UI
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up classes subscription:', error);
    // Return a cleanup function even in case of error
    return () => {};
  }
};

// Booking Management Functions
export const createBooking = async (userId: string, classId: string): Promise<{ success: boolean; message: string }> => {
  console.log('Creating booking for user:', userId, 'class:', classId);
  try {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      console.log('Class not found:', classId);
      return { success: false, message: 'Class not found' };
    }

    const classData = classSnap.data() as Class;
    if (classData.spotsLeft <= 0) {
      console.log('Class is full:', classId);
      return { success: false, message: 'Class is full' };
    }

    const bookingId = `${classId}_${userId}_${Date.now()}`;
    const booking: Booking = {
      id: bookingId,
      classId,
      userId,
      status: 'confirmed',
      bookedAt: new Date()
    };

    await setDoc(doc(db, 'bookings', bookingId), booking);
    await updateDoc(classRef, {
      spotsLeft: classData.spotsLeft - 1,
      updatedAt: new Date()
    });

    console.log('Booking created successfully:', bookingId);
    return { success: true, message: 'Successfully booked class' };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, message: 'Failed to book class' };
  }
};

export const getUserBookings = (userId: string, callback: (bookings: Booking[]) => void) => {
  console.log('Setting up subscription to user bookings for:', userId);
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('userId', '==', userId),
    where('status', '==', 'confirmed')
  );

  try {
    return onSnapshot(q, (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          bookedAt: data.bookedAt?.toDate()
        } as Booking);
      });
      console.log('Received user bookings from Firestore:', bookings);
      callback(bookings);
    }, (error) => {
      console.error('Error in user bookings subscription:', error);
      // You might want to handle this error in your UI
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up user bookings subscription:', error);
    // Return a cleanup function even in case of error
    return () => {};
  }
};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; message: string }> => {
  console.log('Cancelling booking:', bookingId);
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      console.log('Booking not found:', bookingId);
      return { success: false, message: 'Booking not found' };
    }

    const booking = bookingSnap.data() as Booking;
    const classRef = doc(db, 'classes', booking.classId);
    const classSnap = await getDoc(classRef);

    if (!classSnap.exists()) {
      console.log('Class not found:', booking.classId);
      return { success: false, message: 'Class not found' };
    }

    const classData = classSnap.data() as Class;

    await updateDoc(bookingRef, {
      status: 'cancelled',
      updatedAt: new Date()
    });

    await updateDoc(classRef, {
      spotsLeft: classData.spotsLeft + 1,
      updatedAt: new Date()
    });

    console.log('Booking cancelled successfully:', bookingId);
    return { success: true, message: 'Successfully cancelled booking' };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, message: 'Failed to cancel booking' };
  }
}; 