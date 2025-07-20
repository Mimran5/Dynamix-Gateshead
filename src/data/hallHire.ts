export interface HallHirePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  capacity: number;
  features: string[];
  isPopular?: boolean;
  image?: string;
  availableTimes: string[];
  includes: string[];
  restrictions: string[];
}

export const hallHirePackages: HallHirePackage[] = [
  {
    id: 'hourly',
    name: 'Hourly Rate',
    description: 'Perfect for short events, meetings, or individual sessions',
    price: 25,
    duration: 'Per Hour (£25/hour)',
    capacity: 30,
    features: [
      'Flexible booking times',
      'Basic equipment included',
      'Changing facilities',
      'Parking available',
      'Kitchen access'
    ],
    availableTimes: [
      'Monday - Friday: 9:00 AM - 9:00 PM',
      'Saturday: 9:00 AM - 6:00 PM',
      'Sunday: 10:00 AM - 4:00 PM'
    ],
    includes: [
      'Main hall space',
      'Basic sound system',
      'Tables and chairs',
      'Cleaning supplies'
    ],
    restrictions: [
      'No alcohol without prior permission',
      'No smoking',
      'Maximum 30 people',
      'Events must end by closing time'
    ]
  },
  {
    id: 'half-day',
    name: 'Half Day Package',
    description: 'Ideal for workshops, training sessions, or medium-sized events',
    price: 120,
    duration: '4 Hours',
    capacity: 50,
    features: [
      '4 hours of exclusive use',
      'Enhanced equipment setup',
      'Professional sound system',
      'Projector and screen',
      'Kitchen facilities',
      'Free parking for attendees'
    ],
    isPopular: true,
    availableTimes: [
      'Monday - Friday: 9:00 AM - 9:00 PM',
      'Saturday: 9:00 AM - 6:00 PM',
      'Sunday: 10:00 AM - 4:00 PM'
    ],
    includes: [
      'Main hall space',
      'Professional sound system',
      'Projector and screen',
      'Tables and chairs setup',
      'Kitchen access',
      'Cleaning service included'
    ],
    restrictions: [
      'No alcohol without prior permission',
      'No smoking',
      'Maximum 50 people',
      'Events must end by closing time'
    ]
  },
  {
    id: 'full-day',
    name: 'Full Day Package',
    description: 'Complete venue hire for large events, parties, or all-day activities',
    price: 200,
    duration: '8 Hours',
    capacity: 80,
    features: [
      '8 hours of exclusive use',
      'Full venue access',
      'Professional equipment',
      'Event planning support',
      'Setup and cleanup included',
      'Priority booking'
    ],
    availableTimes: [
      'Monday - Friday: 9:00 AM - 9:00 PM',
      'Saturday: 9:00 AM - 6:00 PM',
      'Sunday: 10:00 AM - 4:00 PM'
    ],
    includes: [
      'Full venue access',
      'Professional sound system',
      'Projector and screen',
      'Complete furniture setup',
      'Kitchen facilities',
      'Setup and cleanup service',
      'Event coordinator support'
    ],
    restrictions: [
      'No alcohol without prior permission',
      'No smoking',
      'Maximum 80 people',
      'Events must end by closing time',
      'Security deposit required'
    ]
  },
  {
    id: 'weekend',
    name: 'Weekend Special',
    description: 'Perfect for weekend events, parties, or special occasions',
    price: 350,
    duration: 'Weekend',
    capacity: 100,
    features: [
      'Full weekend access',
      'Complete venue control',
      'Premium equipment',
      'Event planning consultation',
      'Catering kitchen access',
      'Outdoor space included'
    ],
    availableTimes: [
      'Friday: 6:00 PM - 11:00 PM',
      'Saturday: 9:00 AM - 11:00 PM',
      'Sunday: 9:00 AM - 6:00 PM'
    ],
    includes: [
      'Full venue access',
      'Premium sound system',
      'Professional lighting',
      'Complete furniture setup',
      'Catering kitchen',
      'Outdoor space',
      'Event planning consultation',
      'Setup and cleanup service'
    ],
    restrictions: [
      'Alcohol permitted with license',
      'No smoking inside',
      'Maximum 100 people',
      'Security deposit required',
      'Insurance certificate required'
    ]
  }
];

export interface HallBooking {
  id: string;
  packageId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  eventType: string;
  specialRequirements: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export default hallHirePackages; 