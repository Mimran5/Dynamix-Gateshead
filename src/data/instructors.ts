export interface Instructor {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  bio: string;
}

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'Sonni Stuart',
    image: 'https://images.pexels.com/photos/5067710/pexels-photo-5067710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    specialties: ['Gymnastics', 'Youth Training', 'Physical Development'],
    bio: 'Sonni is a certified gymnastics instructor with extensive experience in youth development. She specializes in creating safe, engaging programs that help students build strength, flexibility, and confidence through gymnastics.'
  },
  {
    id: '2',
    name: 'Kainara Motta',
    image: 'https://images.pexels.com/photos/8436741/pexels-photo-8436741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    specialties: ['Yoga', 'Meditation', 'Mindfulness'],
    bio: 'Kainara brings a wealth of experience in yoga and mindfulness practices. Her classes focus on proper alignment, breathing techniques, and creating a peaceful environment for all skill levels.'
  },
  {
    id: '3',
    name: 'Maryna Kiselar',
    image: 'https://images.pexels.com/photos/8171687/pexels-photo-8171687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    specialties: ['Pilates', 'Core Training', 'Posture Improvement'],
    bio: 'Maryna is a certified Pilates instructor with a background in physical therapy. Her knowledge of anatomy and rehabilitation makes her classes both challenging and therapeutic, with a focus on proper form and core strength.'
  },
  {
    id: '4',
    name: 'Perla Ehrentreu',
    image: 'https://images.pexels.com/photos/6456211/pexels-photo-6456211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    specialties: ['Kickboxing', 'Aerobics', 'High-Intensity Training'],
    bio: 'Perla is an energetic instructor who brings enthusiasm and expertise to every class. With certifications in kickboxing and aerobics, she creates dynamic workouts that are both challenging and enjoyable.'
  }
];