import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const classes = [
  // Monday Classes
  {
    id: 'gymnastics-monday-545',
    name: 'Gymnastics (Year 3-4)',
    type: 'gymnastics',
    day: 'Monday',
    time: '17:45',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Sarah',
    level: 'Year 3-4'
  },
  {
    id: 'gymnastics-monday-645',
    name: 'Gymnastics (Year 5-6)',
    type: 'gymnastics',
    day: 'Monday',
    time: '18:45',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Sarah',
    level: 'Year 5-6'
  },
  {
    id: 'kickboxing-monday-8pm',
    name: 'Kickboxing (Advanced)',
    type: 'kickboxing',
    day: 'Monday',
    time: '20:00',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Mike',
    level: 'Advanced'
  },
  {
    id: 'kickboxing-monday-9pm',
    name: 'Kickboxing (Beginners)',
    type: 'kickboxing',
    day: 'Monday',
    time: '21:00',
    duration: 45, // 45 minutes
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Mike',
    level: 'Beginners'
  },

  // Tuesday Classes
  {
    id: 'yoga-tuesday-715',
    name: 'Yoga (Ladies)',
    type: 'yoga',
    day: 'Tuesday',
    time: '19:15',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Emma',
    level: 'Ladies Only'
  },

  // Wednesday Classes
  {
    id: 'gymnastics-wednesday-530',
    name: 'Gymnastics (Year 1-3)',
    type: 'gymnastics',
    day: 'Wednesday',
    time: '17:30',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Sarah',
    level: 'Year 1-3'
  },
  {
    id: 'gymnastics-wednesday-630',
    name: 'Gymnastics (Advanced)',
    type: 'gymnastics',
    day: 'Wednesday',
    time: '18:30',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Sarah',
    level: 'Advanced'
  },
  {
    id: 'pilates-wednesday-815',
    name: 'Pilates (Ladies)',
    type: 'pilates',
    day: 'Wednesday',
    time: '20:15',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Emma',
    level: 'Ladies Only'
  },

  // Thursday Classes
  {
    id: 'aerobics-thursday-6pm',
    name: 'Aerobics (Year 7)',
    type: 'aerobics',
    day: 'Thursday',
    time: '18:00',
    duration: 45, // 45 minutes
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Lisa',
    level: 'Year 7'
  },
  {
    id: 'karate-thursday-650',
    name: 'Karate (Girls)',
    type: 'karate',
    day: 'Thursday',
    time: '18:50',
    duration: 50, // 50 minutes
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach David',
    level: 'Girls Only'
  },
  {
    id: 'gymnastics-thursday-745',
    name: 'Gymnastics (High School)',
    type: 'gymnastics',
    day: 'Thursday',
    time: '19:45',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Sarah',
    level: 'High School'
  },

  // Sunday Classes
  {
    id: 'pilates-sunday-8pm',
    name: 'Pilates (Ladies)',
    type: 'pilates',
    day: 'Sunday',
    time: '20:00',
    duration: 60, // 1 hour
    maxSpots: 12,
    spotsLeft: 12,
    instructor: 'Coach Emma',
    level: 'Ladies Only'
  }
];

export const initializeClasses = async () => {
  console.log('Starting class initialization...');
  const classesRef = collection(db, 'classes');
  
  try {
    for (const classItem of classes) {
      console.log(`Initializing class: ${classItem.name} (${classItem.id})`);
      
      // Check if class already exists
      const classDoc = await getDoc(doc(classesRef, classItem.id));
      if (classDoc.exists()) {
        console.log(`Class ${classItem.id} already exists, skipping...`);
        continue;
      }

      // Create new class
      await setDoc(doc(classesRef, classItem.id), {
        ...classItem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Class ${classItem.id} created successfully`);
    }
    
    console.log('All classes initialized successfully');
  } catch (error) {
    console.error('Error initializing classes:', error);
    throw error;
  }
}; 