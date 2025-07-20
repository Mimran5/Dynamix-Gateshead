const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface HallHireBooking {
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
}

export interface HallHireRate {
  id: string;
  name: string;
  pricePerHour: number;
  capacity: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  error?: string;
}

export const hallHireService = {
  // Get hall hire rate
  async getRate(): Promise<HallHireRate> {
    try {
      const response = await fetch(`${API_BASE_URL}/hall-hire/rate`);
      const data = await response.json();
      
      if (data.success) {
        return data.rate;
      } else {
        throw new Error(data.error || 'Failed to fetch rate');
      }
    } catch (error) {
      console.error('Error fetching hall hire rate:', error);
      throw error;
    }
  },

  // Submit a hall hire booking
  async submitBooking(booking: HallHireBooking): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/hall-hire/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          message: data.message,
          bookingId: data.bookingId,
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to submit booking',
          error: data.error || 'Failed to submit booking',
        };
      }
    } catch (error) {
      console.error('Error submitting hall hire booking:', error);
      return {
        success: false,
        message: 'Network error occurred',
        error: 'Network error occurred',
      };
    }
  },

  // Get booking status (for future use)
  async getBookingStatus(bookingId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/hall-hire/booking/${bookingId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.booking;
      } else {
        throw new Error(data.error || 'Failed to fetch booking status');
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
      throw error;
    }
  },
};

export default hallHireService; 