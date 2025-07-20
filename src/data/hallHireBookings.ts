export interface HallHireBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  expectedAttendees: number;
  eventType: string;
  specialRequirements?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

// Store hall hire bookings in localStorage for now
// In production, this would be stored in a database
export const hallHireBookings: HallHireBooking[] = [];

export const hallHireBookingService = {
  // Get all hall hire bookings
  getAllBookings(): HallHireBooking[] {
    try {
      const stored = localStorage.getItem('hallHireBookings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading hall hire bookings:', error);
      return [];
    }
  },

  // Add a new booking
  addBooking(booking: Omit<HallHireBooking, 'id' | 'createdAt'>): HallHireBooking {
    const newBooking: HallHireBooking = {
      ...booking,
      id: `hall_booking_${Date.now()}`,
      createdAt: new Date()
    };

    const bookings = this.getAllBookings();
    bookings.push(newBooking);
    localStorage.setItem('hallHireBookings', JSON.stringify(bookings));
    
    return newBooking;
  },

  // Check if a time slot is available
  isTimeSlotAvailable(date: string, startTime: string, endTime: string): boolean {
    const bookings = this.getAllBookings();
    const targetDate = new Date(date);
    
    return !bookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      
      const bookingDate = new Date(booking.eventDate);
      if (bookingDate.toDateString() !== targetDate.toDateString()) return false;
      
      // Check for time overlap
      const bookingStart = new Date(`2000-01-01T${booking.startTime}`);
      const bookingEnd = new Date(`2000-01-01T${booking.endTime}`);
      const targetStart = new Date(`2000-01-01T${startTime}`);
      const targetEnd = new Date(`2000-01-01T${endTime}`);
      
      return (
        (targetStart < bookingEnd && targetEnd > bookingStart) ||
        (bookingStart < targetEnd && bookingEnd > targetStart)
      );
    });
  },

  // Get all bookings for a specific date
  getBookingsForDate(date: string): HallHireBooking[] {
    const bookings = this.getAllBookings();
    return bookings.filter(booking => 
      booking.eventDate === date && booking.status !== 'cancelled'
    );
  },

  // Update booking status
  updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled'): boolean {
    const bookings = this.getAllBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) return false;
    
    bookings[bookingIndex].status = status;
    localStorage.setItem('hallHireBookings', JSON.stringify(bookings));
    return true;
  },

  // Delete a booking
  deleteBooking(bookingId: string): boolean {
    const bookings = this.getAllBookings();
    const filteredBookings = bookings.filter(b => b.id !== bookingId);
    
    if (filteredBookings.length === bookings.length) return false;
    
    localStorage.setItem('hallHireBookings', JSON.stringify(filteredBookings));
    return true;
  }
};

export default hallHireBookingService; 