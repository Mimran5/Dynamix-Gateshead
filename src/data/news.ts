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
    title: 'Summer Gymnastics Camp 2024',
    date: '2024-03-15',
    excerpt: 'Join our exciting summer gymnastics camp for beginners and intermediate levels. Limited spots available!',
    content: 'We\'re thrilled to announce our first-ever Summer Gymnastics Camp! This intensive program will run for one week during the summer break, offering young athletes the opportunity to develop their skills in a fun and supportive environment. The camp will include daily training sessions, skill development workshops, and a showcase performance at the end. Perfect for ages 7-14, with separate groups for beginners and intermediate levels. Early registration is now open with a special discount for the first 20 participants!',
    image: '/images/classes/optimized/gymnastics.png',
    category: 'event',
    action: {
      text: 'Register Interest',
      link: '/dashboard?tab=bookings'
    }
  },
  {
    id: '2',
    title: 'Membership Survey - Win Prizes!',
    date: '2024-03-10',
    excerpt: 'Complete our survey for a chance to win one of three amazing prizes. Help shape the future of Dynamix!',
    content: 'We want to hear from you! Take our quick survey to help us understand your fitness goals and preferences. Your feedback will help us improve our services and create better membership options. As a thank you, we\'re giving away three fantastic prizes: 1st Prize - 3 months free membership, 2nd Prize - 1 month free membership, 3rd Prize - £50 class credit. The survey takes just 5 minutes to complete. Winners will be announced on April 1st, 2024.',
    category: 'promotion',
    action: {
      text: 'Take Survey',
      link: 'https://dynamix.bio/form'
    }
  },
  {
    id: '3',
    title: 'Refer a Friend Promotion',
    date: '2024-02-20',
    excerpt: 'Bring a friend to class and you both receive 20% off your next month\'s membership.',
    content: 'Share the joy of movement with friends and save! Throughout April, when you refer a friend who signs up for any membership package, you\'ll both receive 20% off your next month\'s membership fee. There\'s no limit to how many friends you can refer, so the savings can really add up! To participate, simply have your friend mention your name when they register. We believe fitness is better with friends, and we\'re excited to welcome new faces to our community. Terms and conditions apply.',
    category: 'promotion'
  }
];