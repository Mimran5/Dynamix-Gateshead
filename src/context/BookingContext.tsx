import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Booking, WaitlistEntry, ClassBooking } from '../data/bookings';
import { classes } from '../data/classes';

interface BookingContextType {
  bookClass: (classId: string, guestInfo?: { name?: string; email?: string; phone?: string }) => Promise<{ success: boolean; message: string }>;
  cancelBooking: (classId: string) => Promise<{ success: boolean; message: string }>;
  joinWaitlist: (classId: string) => Promise<{ success: boolean; message: string }>;
  leaveWaitlist: (classId: string) => Promise<{ success: boolean; message: string }>;
  getUserBookings: () => Promise<Booking[]>;
  getUserWaitlist: () => Promise<WaitlistEntry[]>;
  getClassAvailability: (classId: string) => Promise<{ available: number; waitlisted: number }>;
  getClassAttendees: (classId: string) => Promise<Booking[]>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const getClassBooking = async (classId: string): Promise<ClassBooking> => {
    const bookingRef = doc(db, 'classBookings', classId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (!bookingSnap.exists()) {
      const newBooking: ClassBooking = {
        classId,
        currentBookings: 0,
        waitlist: [],
        attendance: []
      };
      await setDoc(bookingRef, newBooking);
      return newBooking;
    }
    
    return bookingSnap.data() as ClassBooking;
  };

  const bookClass = async (classId: string, guestInfo?: { name?: string; email?: string; phone?: string }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to book a class' };
    }

    try {
      const classData = classes.find(c => c.id === classId);
      if (!classData) {
        return { success: false, message: 'Class not found' };
      }

      const bookingRef = doc(db, 'classBookings', classId);
      const bookingSnap = await getDoc(bookingRef);
      
      let currentBookings = 0;
      if (bookingSnap.exists()) {
        currentBookings = bookingSnap.data().currentBookings;
      }

      if (currentBookings >= classData.capacity) {
        return { success: false, message: 'Class is full. Would you like to join the waitlist?' };
      }

      const booking: Booking = {
        id: `${classId}_${user.uid}_${Date.now()}`,
        classId,
        userId: user.uid,
        status: 'confirmed',
        bookedAt: new Date(),
        attended: false,
        guestInfo: guestInfo ? {
          name: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone
        } : undefined
      };

      await setDoc(doc(db, 'bookings', booking.id), booking);
      await updateDoc(bookingRef, {
        currentBookings: currentBookings + 1
      });

      return { success: true, message: 'Successfully booked class' };
    } catch (error) {
      console.error('Error booking class:', error);
      return { success: false, message: 'Failed to book class' };
    }
  };

  const joinWaitlist = async (classId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to join the waitlist' };
    }

    try {
      const bookingRef = doc(db, 'classBookings', classId);
      const bookingSnap = await getDoc(bookingRef);
      
      const waitlistEntry: WaitlistEntry = {
        id: `${classId}_${user.uid}_${Date.now()}`,
        classId,
        userId: user.uid,
        joinedAt: new Date(),
        notified: false,
        status: 'waiting'
      };

      if (!bookingSnap.exists()) {
        await setDoc(bookingRef, {
          classId,
          currentBookings: 0,
          waitlist: [waitlistEntry]
        });
      } else {
        const bookingData = bookingSnap.data();
        const existingEntry = bookingData.waitlist.find(
          (entry: WaitlistEntry) => entry.userId === user.uid && entry.status === 'waiting'
        );

        if (existingEntry) {
          return { success: false, message: 'You are already on the waitlist' };
        }

        await updateDoc(bookingRef, {
          waitlist: [...bookingData.waitlist, waitlistEntry]
        });
      }

      return { success: true, message: 'Successfully joined waitlist' };
    } catch (error) {
      console.error('Error joining waitlist:', error);
      return { success: false, message: 'Failed to join waitlist' };
    }
  };

  const cancelBooking = async (classId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to cancel a booking' };
    }

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('classId', '==', classId),
        where('userId', '==', user.uid),
        where('status', '==', 'confirmed')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return { success: false, message: 'No active booking found' };
      }

      const bookingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'bookings', bookingDoc.id), {
        status: 'cancelled'
      });

      const bookingRef = doc(db, 'classBookings', classId);
      const bookingSnap = await getDoc(bookingRef);
      
      if (bookingSnap.exists()) {
        const bookingData = bookingSnap.data();
        await updateDoc(bookingRef, {
          currentBookings: bookingData.currentBookings - 1
        });

        // Check waitlist and notify next person
        if (bookingData.waitlist.length > 0) {
          const nextPerson = bookingData.waitlist[0];
          await updateDoc(doc(db, 'classBookings', classId), {
            waitlist: bookingData.waitlist.slice(1),
            currentBookings: bookingData.currentBookings
          });

          // TODO: Implement notification system
        }
      }

      return { success: true, message: 'Successfully cancelled booking' };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, message: 'Failed to cancel booking' };
    }
  };

  const leaveWaitlist = async (classId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to leave the waitlist' };
    }

    try {
      const bookingRef = doc(db, 'classBookings', classId);
      const bookingSnap = await getDoc(bookingRef);
      
      if (!bookingSnap.exists()) {
        return { success: false, message: 'No waitlist found' };
      }

      const bookingData = bookingSnap.data();
      const updatedWaitlist = bookingData.waitlist.filter(
        (entry: WaitlistEntry) => !(entry.userId === user.uid && entry.status === 'waiting')
      );

      await updateDoc(bookingRef, {
        waitlist: updatedWaitlist
      });

      return { success: true, message: 'Successfully left waitlist' };
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      return { success: false, message: 'Failed to leave waitlist' };
    }
  };

  const getUserBookings = async (): Promise<Booking[]> => {
    if (!user) return [];

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'confirmed')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Booking);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  };

  const getUserWaitlist = async (): Promise<WaitlistEntry[]> => {
    if (!user) return [];

    try {
      const bookingsRef = collection(db, 'classBookings');
      const q = query(bookingsRef);
      const querySnapshot = await getDocs(q);
      
      const waitlistEntries: WaitlistEntry[] = [];
      querySnapshot.forEach(doc => {
        const bookingData = doc.data();
        const userEntry = bookingData.waitlist.find(
          (entry: WaitlistEntry) => entry.userId === user.uid && entry.status === 'waiting'
        );
        if (userEntry) {
          waitlistEntries.push(userEntry);
        }
      });

      return waitlistEntries;
    } catch (error) {
      console.error('Error fetching user waitlist:', error);
      return [];
    }
  };

  const getClassAvailability = async (classId: string): Promise<{ available: number; waitlisted: number }> => {
    try {
      const classDoc = await getDoc(doc(db, 'classBookings', classId));
      if (classDoc.exists()) {
        const data = classDoc.data() as ClassBooking;
        return {
          available: data.currentBookings || 0,
          waitlisted: data.waitlist?.length || 0
        };
      }
    } catch (error) {
      console.error('Error fetching class availability:', error);
    }
    return { available: 0, waitlisted: 0 };
  };

  const getClassAttendees = async (classId: string): Promise<Booking[]> => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('classId', '==', classId));
      const querySnapshot = await getDocs(q);
      const attendees: Booking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attendees.push({
          id: doc.id,
          classId: data.classId,
          userId: data.userId,
          status: data.status,
          bookedAt: data.bookedAt.toDate(),
          attended: data.attended || false,
          attendanceMarkedBy: data.attendanceMarkedBy,
          attendanceMarkedAt: data.attendanceMarkedAt?.toDate(),
          attendanceNotes: data.attendanceNotes,
          guestInfo: data.guestInfo,
          userDetails: data.userDetails || undefined
        });
      });
      return attendees;
    } catch (error) {
      console.error('Error fetching class attendees:', error);
      return [];
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookClass,
        cancelBooking,
        joinWaitlist,
        leaveWaitlist,
        getUserBookings,
        getUserWaitlist,
        getClassAvailability,
        getClassAttendees
      }}
    >
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