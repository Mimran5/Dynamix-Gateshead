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
    id: 'teresa-carter',
    name: 'Teresa Carter',
    specialty: 'Pilates',
    bio: 'With over 10 years of experience, Teresa is a certified Pilates instructor with a passion for helping clients build core strength and improve posture. Her classes focus on proper form and technique.'
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
    specialty: 'Aerobics',
    bio: 'Perla is a passionate aerobics instructor who brings energy and fun to every class. Her sessions are designed to boost fitness and motivation.'
  },
  {
    id: 'kainara-motta',
    name: 'Kainara Motta',
    specialty: 'Yoga',
    bio: 'Kainara is a dedicated yoga instructor who helps students find balance, flexibility, and peace through mindful movement and breath.'
  },
  {
    id: 'julie-murphy',
    name: 'Julie Murphy',
    specialty: 'Karate',
    bio: 'Julie is a dedicated karate instructor with a passion for teaching traditional martial arts. She focuses on developing discipline, respect, and technical excellence in her students.'
  }
];