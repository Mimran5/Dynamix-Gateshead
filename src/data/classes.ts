export interface ClassType {
  id: string;
  name: string;
  color: string;
}

export const classTypes: ClassType[] = [
  { id: 'dance', name: 'Dance', color: '#0D9488' },
  { id: 'yoga', name: 'Yoga', color: '#7E22CE' },
  { id: 'pilates', name: 'Pilates', color: '#F97316' },
  { id: 'gymnastics', name: 'Gymnastics', color: '#2563EB' },
  { id: 'fitness', name: 'Fitness', color: '#DC2626' },
  { id: 'karate', name: 'Karate', color: '#059669' },
];

export interface Class {
  id: string;
  name: string;
  type: string;
  description: string;
  instructor: string;
  day: string;
  time: string;
  duration: number; // in minutes
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  capacity: number;
}

export const classes: Class[] = [
  {
    id: '1',
    name: 'Gymnastics Year 3-4',
    type: 'gymnastics',
    description: 'Gymnastics class tailored for Year 3-4 students, focusing on fundamental skills and techniques.',
    instructor: 'Sonni Stuart',
    day: 'Monday',
    time: '17:45',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '2',
    name: 'Gymnastics Year 5-6',
    type: 'gymnastics',
    description: 'Gymnastics class designed for Year 5-6 students, building on basic skills and introducing advanced techniques.',
    instructor: 'Sonni Stuart',
    day: 'Monday',
    time: '18:45',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '3',
    name: 'Ladies Kickboxing',
    type: 'fitness',
    description: 'High-energy kickboxing class for ladies aged 20+, combining martial arts techniques with cardio workout.',
    instructor: 'Olivia Appleby',
    day: 'Monday',
    time: '20:00',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '4',
    name: 'Ladies Yoga',
    type: 'yoga',
    description: 'Relaxing and rejuvenating yoga session designed specifically for ladies.',
    instructor: 'Perla Ehrentreu',
    day: 'Tuesday',
    time: '19:15',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '5',
    name: 'Junior Gymnastics',
    type: 'gymnastics',
    description: 'Gymnastics class focusing on fundamental skills and techniques.',
    instructor: 'Sonni Stuart',
    day: 'Wednesday',
    time: '17:30',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '6',
    name: 'Invite-Only Gymnastics',
    type: 'gymnastics',
    description: 'Exclusive gymnastics class for invited students, focusing on advanced techniques and personalized training.',
    instructor: 'Sonni Stuart',
    day: 'Wednesday',
    time: '18:30',
    duration: 60,
    level: 'Advanced',
    capacity: 8,
  },
  {
    id: '7',
    name: 'Ladies Pilates',
    type: 'pilates',
    description: 'Core-strengthening Pilates class designed for ladies.',
    instructor: 'Maryna Kiselar',
    day: 'Wednesday',
    time: '20:15',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '8',
    name: 'Year 7 Aerobics',
    type: 'fitness',
    description: 'High-energy aerobics class specifically designed for Year 7 students.',
    instructor: 'Perla Ehrentreu',
    day: 'Thursday',
    time: '18:15',
    duration: 45,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '9',
    name: 'Karate',
    type: 'karate',
    description: 'Traditional karate class teaching fundamental techniques, forms, and self-defense.',
    instructor: 'Julie Murphy',
    day: 'Thursday',
    time: '18:50',
    duration: 50,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '10',
    name: 'Ladies Pilates',
    type: 'pilates',
    description: 'Evening Pilates class exclusively for ladies, focusing on core strength and flexibility.',
    instructor: 'Maryna Kiselar',
    day: 'Sunday',
    time: '20:00',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
  {
    id: '11',
    name: 'High School Gymnastics',
    type: 'gymnastics',
    description: 'A gymnastics class for high school students focusing on advanced skills, strength, and flexibility.',
    instructor: 'Sonni Stuart',
    day: 'Thursday',
    time: '19:45',
    duration: 60,
    level: 'All Levels',
    capacity: 12,
  },
];

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const timeSlots = [
  '17:00', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00',
  '19:15', '19:30', '20:00', '20:15', '20:30', '21:00'
];