import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const classes = [
  // Monday Classes
  {
    id: '1',
    name: 'Gymnastics Year 3-4',
    type: 'gymnastics',
    day: 'Monday',
    time: '17:45',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Sonni Stuart',
    level: 'All Levels',
    description: 'Gymnastics class tailored for Year 3-4 students, focusing on fundamental skills and techniques.',
    waitlist: false
  },
  {
    id: '2',
    name: 'Gymnastics Year 5-6',
    type: 'gymnastics',
    day: 'Monday',
    time: '18:45',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Sonni Stuart',
    level: 'All Levels',
    description: 'Gymnastics class designed for Year 5-6 students, building on basic skills and introducing advanced techniques.',
    waitlist: false
  },
  {
    id: '3',
    name: 'Ladies Kickboxing',
    type: 'kickboxing',
    day: 'Monday',
    time: '20:00',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Olivia Appleby',
    level: 'Advanced',
    description: 'High-energy kickboxing class for ladies aged 20+, combining martial arts techniques with cardio workout.',
    waitlist: false
  },
  {
    id: '12',
    name: 'Ladies Kickboxing',
    type: 'kickboxing',
    day: 'Monday',
    time: '21:00',
    duration: 45,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Olivia Appleby',
    level: 'Beginner',
    description: 'Beginner-friendly kickboxing class for ladies aged 20+, focusing on basic techniques and fitness.',
    waitlist: false
  },

  // Tuesday Classes
  {
    id: '4',
    name: 'Ladies Yoga',
    type: 'yoga',
    day: 'Tuesday',
    time: '19:15',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Kainara Motta',
    level: 'All Levels',
    description: 'Relaxing and rejuvenating yoga session designed specifically for ladies.',
    waitlist: false
  },
  {
    id: '13',
    name: 'Yoga (Unconfirmed)',
    type: 'yoga',
    day: 'Tuesday',
    time: '20:30',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Kainara Motta',
    level: 'All Levels',
    description: 'Unconfirmed yoga class for all levels.',
    waitlist: false
  },

  // Wednesday Classes
  {
    id: '5',
    name: 'Junior Gymnastics',
    type: 'gymnastics',
    day: 'Wednesday',
    time: '17:30',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Sonni Stuart',
    level: 'All Levels',
    description: 'Gymnastics class focusing on fundamental skills and techniques.',
    waitlist: false
  },
  {
    id: '6',
    name: 'Invite-Only Gymnastics',
    type: 'gymnastics',
    day: 'Wednesday',
    time: '18:30',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Sonni Stuart',
    level: 'Advanced',
    description: 'Exclusive gymnastics class for invited students, focusing on advanced techniques and personalized training.',
    waitlist: false
  },
  {
    id: '7',
    name: 'Ladies Pilates',
    type: 'pilates',
    day: 'Wednesday',
    time: '20:15',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Teresa Carter',
    level: 'All Levels',
    description: 'Core-strengthening Pilates class designed for ladies.',
    waitlist: false
  },

  // Thursday Classes
  {
    id: '8',
    name: 'Year 7 Aerobics',
    type: 'aerobics',
    day: 'Thursday',
    time: '18:15',
    duration: 45,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Perla Ehrentreu',
    level: 'All Levels',
    description: 'High-energy aerobics class specifically designed for Year 7 students.',
    waitlist: false
  },
  {
    id: '9',
    name: 'Karate',
    type: 'karate',
    day: 'Thursday',
    time: '18:50',
    duration: 50,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Julie Murphy',
    level: 'All Levels',
    description: 'Traditional karate class teaching fundamental techniques, forms, and self-defense.',
    waitlist: false
  },
  {
    id: '11',
    name: 'High School Gymnastics',
    type: 'gymnastics',
    day: 'Thursday',
    time: '19:45',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Sonni Stuart',
    level: 'All Levels',
    description: 'A gymnastics class for high school students focusing on advanced skills, strength, and flexibility.',
    waitlist: false
  },

  // Sunday Classes
  {
    id: '10',
    name: 'Ladies Pilates',
    type: 'pilates',
    day: 'Sunday',
    time: '20:00',
    duration: 60,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Teresa Carter',
    level: 'All Levels',
    description: 'Evening Pilates class exclusively for ladies, focusing on core strength and flexibility.',
    waitlist: false
  },
  {
    id: '14',
    name: 'Aerobics 18+',
    type: 'aerobics',
    day: 'Sunday',
    time: '19:15',
    duration: 45,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Perla Ehrentreu',
    level: 'All Levels',
    description: 'Aerobics class for adults 18+ focusing on cardio and fun routines.',
    waitlist: false
  },
  {
    id: '15',
    name: 'Zumba',
    type: 'zumba',
    day: 'Sunday',
    time: '18:15',
    duration: 45,
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Aidy Connick',
    level: 'All Levels',
    description: 'High-energy dance fitness class combining Latin and international music with dance moves.',
    waitlist: false
  }
];

export const initializeClasses = async () => {
  console.log('Initializing classes with correct data...');
  
  for (const classItem of classes) {
    const classRef = doc(db, 'classes', classItem.id);
    const classSnap = await getDoc(classRef);
    
    if (!classSnap.exists()) {
      console.log(`Creating class: ${classItem.name} (${classItem.id}) with instructor: ${classItem.instructor}`);
      
      await setDoc(classRef, {
        ...classItem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Class ${classItem.id} created successfully`);
    } else {
      console.log(`Class ${classItem.id} already exists, updating with correct data...`);
      
      await setDoc(classRef, {
        ...classItem,
        createdAt: classSnap.data().createdAt || new Date(),
        updatedAt: new Date()
      });
      console.log(`Class ${classItem.id} updated successfully`);
    }
  }
  
  console.log('All classes initialized successfully!');
}; 