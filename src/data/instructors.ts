export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
}

export const instructors: Instructor[] = [
  {
    id: 'sonni-stuart',
    name: 'Sonni Stuart',
    specialty: 'Gymnastics',
    bio: 'Sonni is a certified gymnastics instructor with extensive experience in coaching students of all levels. She specializes in developing fundamental skills and advanced techniques in gymnastics.'
  },
  {
    id: 'maryna-kiselar',
    name: 'Maryna Kiselar',
    specialty: 'Pilates',
    bio: 'Maryna is a certified Pilates instructor with a passion for helping clients build core strength and improve posture. Her classes focus on proper form and technique.'
  },
  {
    id: 'olivia-appleby',
    name: 'Olivia Appleby',
    specialty: 'Kickboxing',
    bio: 'Olivia is a professional kickboxing instructor with a background in competitive martial arts. She brings energy and expertise to her high-intensity kickboxing classes.'
  },
  {
    id: 'perla-ehrentreu',
    name: 'Perla Ehrentreu',
    specialty: 'Aerobics & Yoga',
    bio: 'Perla is a versatile instructor specializing in both aerobics and yoga. She combines dynamic movement with mindful practice to create balanced and effective workouts.'
  },
  {
    id: 'kainara-motta',
    name: 'Kainara Motta',
    specialty: 'Karate',
    bio: 'Kainara is a skilled karate instructor with years of experience in traditional martial arts. She teaches students of all ages the fundamentals and advanced techniques of karate.'
  },
  {
    id: 'julie-murphy',
    name: 'Julie Murphy',
    specialty: 'Karate',
    bio: 'Julie is a dedicated karate instructor with a passion for teaching traditional martial arts. She focuses on developing discipline, respect, and technical excellence in her students.'
  }
];