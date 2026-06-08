import { IMAGES } from './images';

export type EventCategory = 'home' | 'concerts' | 'theater' | 'kids' | 'standup';

export interface Event {
  id: string;
  category: Exclude<EventCategory, 'home'>;
  title: string;
  venue: string;
  date: string;
  time: string;
  priceFrom: number;
  priceTo: number;
  imageUrl: string;
  top?: boolean;
}

export const events: Event[] = [
  {
    id: 'c1',
    category: 'concerts',
    title: 'Neon Pulse World Tour',
    venue: 'Madison Square Garden',
    date: 'Jun 13, Sat',
    time: '8:00 PM',
    priceFrom: 59,
    priceTo: 199,
    imageUrl: IMAGES.concertCrowd,
    top: true,
  },
  {
    id: 'c2',
    category: 'concerts',
    title: 'Aurora Live in Concert',
    venue: 'Red Rocks Amphitheatre',
    date: 'Jun 15, Mon',
    time: '7:30 PM',
    priceFrom: 45,
    priceTo: 120,
    imageUrl: IMAGES.concertSinger,
  },
  {
    id: 'c3',
    category: 'concerts',
    title: 'Electric Dreams Festival',
    venue: 'Brooklyn Steel',
    date: 'Jun 20, Sat',
    time: '9:00 PM',
    priceFrom: 75,
    priceTo: 250,
    imageUrl: IMAGES.concertFestival,
  },
  {
    id: 'c4',
    category: 'concerts',
    title: 'Jazz Under the Stars',
    venue: 'Hollywood Bowl',
    date: 'Jun 22, Mon',
    time: '6:30 PM',
    priceFrom: 35,
    priceTo: 95,
    imageUrl: IMAGES.concertJazz,
  },
  {
    id: 'c5',
    category: 'concerts',
    title: 'Indie Night: The Wanderers',
    venue: 'The Fillmore',
    date: 'Jun 28, Sat',
    time: '8:30 PM',
    priceFrom: 28,
    priceTo: 65,
    imageUrl: IMAGES.concertOutdoor,
  },

  {
    id: 't1',
    category: 'theater',
    title: 'Hamlet',
    venue: 'Royal National Theatre',
    date: 'Jun 14, Sun',
    time: '7:00 PM',
    priceFrom: 40,
    priceTo: 110,
    imageUrl: IMAGES.theaterStage,
    top: true,
  },
  {
    id: 't2',
    category: 'theater',
    title: 'The Phantom of the Opera',
    venue: 'Her Majesty\'s Theatre',
    date: 'Jun 16, Tue',
    time: '7:30 PM',
    priceFrom: 55,
    priceTo: 180,
    imageUrl: IMAGES.theaterOpera,
  },
  {
    id: 't3',
    category: 'theater',
    title: 'A Midsummer Night\'s Dream',
    venue: 'Shakespeare\'s Globe',
    date: 'Jun 19, Fri',
    time: '6:00 PM',
    priceFrom: 25,
    priceTo: 75,
    imageUrl: IMAGES.theaterSeats,
  },
  {
    id: 't4',
    category: 'theater',
    title: 'Death of a Salesman',
    venue: 'Broadway Theatre',
    date: 'Jun 21, Sun',
    time: '8:00 PM',
    priceFrom: 50,
    priceTo: 150,
    imageUrl: IMAGES.theaterMic,
  },

  {
    id: 'k1',
    category: 'kids',
    title: 'The Magic Puppet Show',
    venue: 'Children\'s Theatre Company',
    date: 'Jun 14, Sun',
    time: '11:00 AM',
    priceFrom: 15,
    priceTo: 30,
    imageUrl: IMAGES.kidsParty,
    top: true,
  },
  {
    id: 'k2',
    category: 'kids',
    title: 'Panda\'s Big Adventure',
    venue: 'Family Stage',
    date: 'Jun 15, Mon',
    time: '12:00 PM',
    priceFrom: 18,
    priceTo: 35,
    imageUrl: IMAGES.kidsBalloons,
  },
  {
    id: 'k3',
    category: 'kids',
    title: 'Ice Circus Spectacular',
    venue: 'City Arena',
    date: 'Jun 18, Thu',
    time: '4:00 PM',
    priceFrom: 30,
    priceTo: 80,
    imageUrl: IMAGES.kidsCircus,
  },
  {
    id: 'k4',
    category: 'kids',
    title: 'Shrek: The Musical',
    venue: 'Grand Opera House',
    date: 'Jun 22, Sun',
    time: '1:00 PM',
    priceFrom: 35,
    priceTo: 90,
    imageUrl: IMAGES.kidsCelebration,
  },

  {
    id: 's1',
    category: 'standup',
    title: 'Open Mic Comedy Night',
    venue: 'The Comedy Cellar',
    date: 'Jun 13, Sat',
    time: '8:00 PM',
    priceFrom: 20,
    priceTo: 45,
    imageUrl: IMAGES.standupStage,
    top: true,
  },
  {
    id: 's2',
    category: 'standup',
    title: 'Dave Reynolds: Live',
    venue: 'Laugh Factory',
    date: 'Jun 17, Wed',
    time: '7:30 PM',
    priceFrom: 45,
    priceTo: 85,
    imageUrl: IMAGES.standupSpotlight,
  },
  {
    id: 's3',
    category: 'standup',
    title: 'Friday Night Stand-Up',
    venue: 'Caroline\'s on Broadway',
    date: 'Jun 20, Sat',
    time: '9:00 PM',
    priceFrom: 30,
    priceTo: 60,
    imageUrl: IMAGES.standupCrowd,
  },
  {
    id: 's4',
    category: 'standup',
    title: 'Roast Battle Championship',
    venue: 'The Improv',
    date: 'Jun 25, Thu',
    time: '8:30 PM',
    priceFrom: 25,
    priceTo: 50,
    imageUrl: IMAGES.standupLaugh,
  },
];

export type CategoryKey = EventCategory | 'cinema';

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'home', label: 'HOME' },
  { key: 'concerts', label: 'CONCERTS' },
  { key: 'theater', label: 'THEATER' },
  { key: 'kids', label: 'KIDS' },
  { key: 'standup', label: 'STAND-UP' },
  { key: 'cinema', label: 'CINEMA' },
];

export function getEventsByCategory(category: CategoryKey): Event[] {
  if (category === 'home') return events.filter((e) => e.top);
  if (category === 'cinema') return [];
  return events.filter((e) => e.category === category);
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}
