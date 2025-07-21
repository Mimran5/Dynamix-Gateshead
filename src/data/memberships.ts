export interface Membership {
  id: string;
  name: string;
  price: number;
  period: 'monthly';
  features: string[];
  isPopular?: boolean;
  costPerClass: number;
  savings: number;
  usage: string;
}

export const memberships: Membership[] = [
  {
    id: 'basic',
    name: '6 Class Package',
    price: 33,
    period: 'monthly',
    costPerClass: 5.50,
    savings: 6,
    usage: 'Individual only',
    features: [
      '6 classes per month',
      'Valid for all listed class types',
      'Flexible scheduling via online booking',
      'Online booking system and account management'
    ]
  },
  {
    id: 'standard',
    name: '10 Class Package',
    price: 49,
    period: 'monthly',
    costPerClass: 4.90,
    savings: 16,
    usage: 'Individual only',
    features: [
      '10 classes per month',
      'Valid for all listed class types',
      'Flexible scheduling via online booking',
      'Online booking system and account management'
    ],
    isPopular: true
  },
  {
    id: 'family',
    name: '20 Class Family Package',
    price: 95,
    period: 'monthly',
    costPerClass: 4.75,
    savings: 35,
    usage: 'Parents & siblings only',
    features: [
      '20 classes per month',
      'Can be shared between immediate family – parents and siblings only',
      'Valid for all listed class types',
      'Flexible scheduling via online booking',
      'Online booking system and account management'
    ]
  }
];

export default memberships;