export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  bookedAt: Date;
  attended: boolean;
  attendanceMarkedBy?: string; // Admin ID who marked attendance
  attendanceMarkedAt?: Date;
  attendanceNotes?: string;
  guestInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  userDetails?: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface WaitlistEntry {
  id: string;
  classId: string;
  userId: string;
  joinedAt: Date;
  notified: boolean;
  status: 'waiting' | 'offered' | 'declined' | 'expired';
}

export interface ClassBooking {
  classId: string;
  currentBookings: number;
  waitlist: WaitlistEntry[];
  attendance: {
    date: Date;
    markedBy: string;
    attendees: string[]; // Array of user IDs
    noShows: string[]; // Array of user IDs
  }[];
}

// This will be stored in Firebase
export const classBookings: Record<string, ClassBooking> = {}; 