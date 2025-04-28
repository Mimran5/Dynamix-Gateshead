export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
  category: 'announcement' | 'event' | 'promotion' | 'class';
}

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'New Aerial Yoga Classes Starting Next Month',
    date: '2025-03-15',
    excerpt: 'Experience the joy of defying gravity with our new aerial yoga classes, starting April 5th.',
    content: 'We\'re excited to announce the addition of Aerial Yoga to our class schedule! Starting April 5th, instructor Lisa Mendes will be leading these unique sessions that combine traditional yoga poses with aerial arts using silk hammocks. This practice offers numerous benefits including spinal decompression, improved flexibility, and core strengthening—all while experiencing the joy of being suspended in air. Classes will be available for beginners and intermediate levels. Spaces are limited to 8 participants per class, so book early!',
    image: 'https://images.pexels.com/photos/6111641/pexels-photo-6111641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'class'
  },
  {
    id: '2',
    title: 'Summer Dance Intensive Workshop',
    date: '2025-03-10',
    excerpt: 'Join us for a week-long immersive dance experience with guest choreographers from around the country.',
    content: 'Mark your calendars for our annual Summer Dance Intensive Workshop! From July 10-17, we\'ll be hosting an immersive week-long program featuring guest choreographers from premier dance companies across the country. Participants will experience a variety of dance styles including contemporary, jazz, hip hop, and ballet, culminating in a showcase performance. This workshop is open to intermediate and advanced dancers ages 14+. Early bird registration is now open with a 15% discount until April 30th. Don\'t miss this opportunity to elevate your dance skills and connect with industry professionals!',
    image: 'https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'event'
  },
  {
    id: '3',
    title: 'Studio Renovation Complete',
    date: '2025-03-01',
    excerpt: 'Our newly renovated Studio B is now open, featuring state-of-the-art flooring and enhanced acoustics.',
    content: 'We\'re thrilled to announce the completion of our Studio B renovation! After six weeks of construction, the space has been transformed with professional sprung flooring, wall-to-wall mirrors, enhanced acoustics, and a new sound system. The upgrades will provide a safer, more comfortable environment for our dance and fitness classes. We\'ve also expanded the changing rooms and added more storage cubbies for your convenience. Come experience our improved facilities—we think you\'ll love the difference these enhancements make to your practice!',
    category: 'announcement'
  },
  {
    id: '4',
    title: 'Refer a Friend Promotion',
    date: '2025-02-20',
    excerpt: 'Bring a friend to class and you both receive 20% off your next month\'s membership.',
    content: 'Share the joy of movement with friends and save! Throughout April, when you refer a friend who signs up for any membership package, you\'ll both receive 20% off your next month\'s membership fee. There\'s no limit to how many friends you can refer, so the savings can really add up! To participate, simply have your friend mention your name when they register. We believe fitness is better with friends, and we\'re excited to welcome new faces to our community. Terms and conditions apply.',
    category: 'promotion'
  },
  {
    id: '5',
    title: 'New Kids\' Gymnastics Program',
    date: '2025-02-15',
    excerpt: 'Introducing our expanded gymnastics program for children ages 4-12, with age-appropriate classes and skill levels.',
    content: 'We\'re expanding our offerings for young athletes! Our new comprehensive kids\' gymnastics program launches March 1st with dedicated classes for ages 4-6, 7-9, and 10-12. Each age group will focus on developmentally appropriate skills, from basic coordination and tumbling for the youngest group to more advanced techniques for older children. Our expanded program includes both recreational classes and a pre-competitive track for those interested in pursuing gymnastics more seriously. All classes are taught by certified gymnastics instructors in our newly equipped gymnasium. Registration is now open!',
    image: 'https://images.pexels.com/photos/3976318/pexels-photo-3976318.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'class'
  }
];