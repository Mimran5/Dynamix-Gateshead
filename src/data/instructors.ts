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
    specialty: 'Yoga & Meditation',
    bio: 'Sonni is a certified yoga instructor with over 10 years of experience. She specializes in Vinyasa and Yin yoga, helping students find balance and inner peace through mindful movement and breath work.'
  },
  {
    id: 'kainara-motta',
    name: 'Kainara Motta',
    specialty: 'Pilates & Core Training',
    bio: 'Kainara is passionate about helping clients build core strength and improve posture through Pilates. Her energetic teaching style and attention to form make her classes both challenging and rewarding.'
  },
  {
    id: 'maryna-kiselar',
    name: 'Maryna Kiselar',
    specialty: 'Gymnastics & Flexibility',
    bio: 'With a background in competitive gymnastics, Maryna brings expertise in body control and flexibility training. She helps students of all levels develop strength, balance, and grace through movement.'
  },
  {
    id: 'perla-ehrentreu',
    name: 'Perla Ehrentreu',
    specialty: 'Strength & Conditioning',
    bio: 'Perla is a certified personal trainer specializing in functional fitness and strength training. Her workouts focus on building practical strength and improving overall fitness for daily life.'
  }
];