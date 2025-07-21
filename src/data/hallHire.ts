export interface HallHireRate {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  capacity: number;
  features: string[];
  availableTimes: string[];
  includes: string[];
  restrictions: string[];
}

export const hallHireRate: HallHireRate = {
  id: 'hourly',
  name: 'Hourly Hall Hire',
  description: 'Flexible hourly booking for events, meetings, workshops, and special occasions',
  pricePerHour: 25,
  capacity: 30,
  features: [
    'Flexible booking times',
    'Chairs and tables included',
    'Changing facilities',
    'Parking available',
    'Kitchen access',
    'Main hall space',
    'Cleaning supplies'
  ],
  availableTimes: [
    'Monday - Friday: 9:00 AM - 9:00 PM',
    'Saturday: 9:00 AM - 6:00 PM',
    'Sunday: 10:00 AM - 4:00 PM'
  ],
  includes: [
    'Main hall space',
    'Chairs and tables',
    'Cleaning supplies',
    'Kitchen access',
    'Changing facilities',
    'Parking for attendees'
  ],
  restrictions: [
    'No alcohol without prior permission',
    'No smoking',
    'Maximum 30 people',
    'Events must end by closing time',
    'Minimum 1 hour booking'
  ]
};

export interface HallBooking {
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
  specialRequirements: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export default hallHireRate; 