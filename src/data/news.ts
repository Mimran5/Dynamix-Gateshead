export interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
  category: 'announcement' | 'event' | 'promotion' | 'class';
  action?: {
    text: string;
    link: string;
  };
}

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Summer Gymnastics Camp 2025',
    date: '2025-06-15',
    excerpt: 'Join our exciting summer gymnastics camp for beginners and intermediate levels. Limited spots available!',
    content: 'We\'re thrilled to announce our first-ever Summer Gymnastics Camp! This intensive program will run for one week during the summer break in 2025, offering young athletes the opportunity to develop their skills in a fun and supportive environment. The camp will include daily training sessions, skill development workshops, and a showcase performance at the end. Perfect for ages 7-14, with separate groups for beginners and intermediate levels. Early registration is now open with a special discount for the first 20 participants!',
    image: '/images/classes/optimized/gymnastics.png',
    category: 'event',
    action: {
      text: 'Register Interest',
      link: '/dashboard?tab=bookings'
    }
  },
  {
    id: '2',
    title: 'Membership Survey - Win Amazing Prizes!',
    date: '2025-06-15',
    excerpt: 'Complete our survey for a chance to win £100 or a Free Family Membership. Share your opinion and win big!',
    content: '🎉 Win £100 or a Free Family Membership! 🎉\n\nShare your opinion in our quick 3-minute survey and get the chance to win:\n🥇 £100 (1st prize)\n🥈 1 Month Free Family Membership (2nd & 3rd prize — worth £95)\n\nPLUS: Refer friends and get 1 bonus entry for every person who completes it and mentions your name!\n\nRaffle closes on 30th June 2025 – don\'t miss your chance to win!',
    category: 'promotion',
    action: {
      text: 'Take Survey',
      link: 'https://dynamix.bio/form'
    }
  },
  {
    id: '3',
    title: 'Refer a Friend Promotion',
    date: '2025-06-15',
    excerpt: 'Bring a friend to class and you both receive 20% off your next month\'s membership.',
    content: 'Share the joy of movement with friends and save! Throughout April, when you refer a friend who signs up for any membership package, you\'ll both receive 20% off your next month\'s membership fee. There\'s no limit to how many friends you can refer, so the savings can really add up! To participate, simply have your friend mention your name when they register. We believe fitness is better with friends, and we\'re excited to welcome new faces to our community. Terms and conditions apply.',
    category: 'promotion'
  }
];