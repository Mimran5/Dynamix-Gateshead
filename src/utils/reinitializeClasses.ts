import { initializeClasses } from './initializeClasses';

// This script will reinitialize all classes with the correct data
const reinitializeClasses = async () => {
  try {
    console.log('Reinitializing classes with correct data...');
    await initializeClasses();
    console.log('Classes reinitialized successfully!');
  } catch (error) {
    console.error('Error reinitializing classes:', error);
  }
};

// Run the reinitialization
reinitializeClasses(); 