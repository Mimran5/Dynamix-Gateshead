export interface Membership {
  id: string;
  name: string;
  price: number;
  period: 'monthly';
  features: string[];
  isPopular?: boolean;
}

export const memberships: Membership[] = [
  {
    id: 'basic',
    name: '6 Class Package',
    price: 29,
    period: 'monthly',
    features: [
      'Access to any 6 classes per month',
      'Valid for all class types',
      'Online booking system',
      'Flexible class scheduling',
      'No registration fee'
    ]
  },
  {
    id: 'standard',
    name: '10 Class Package',
    price: 49,
    period: 'monthly',
    features: [
      'Access to any 10 classes per month',
      'Valid for all class types',
      'Online booking system',
      'Flexible class scheduling',
      'Priority booking'
    ],
    isPopular: true
  },
  {
    id: 'family',
    name: 'Family Package',
    price: 89,
    period: 'monthly',
    features: [
      'Share 20 classes per month between immediate family members',
      'Valid for all class types',
      'Online booking system',
      'Flexible class scheduling',
      'Priority booking for all family members',
      'Family account management'
    ]
  }
];

export default memberships;