import { initializeClasses } from '../utils/initializeClasses';

const initializeFirestore = async () => {
  try {
    await initializeClasses();
    console.log('Firestore initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    process.exit(1);
  }
};

initializeFirestore(); 