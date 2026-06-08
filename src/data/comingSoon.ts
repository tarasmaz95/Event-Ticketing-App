import { IMAGES } from './images';

export interface ComingSoonItem {
  id: string;
  title: string;
  originalTitle: string;
  imageUrl: string;
  ageRating: string;
  formats: string;
  rating: number;
  nextSessionDate: string;
  duration: string;
  genres: string;
  description: string;
  kind: 'movie' | 'event';
  releaseDate: string;
  venue?: string;
}

export const comingSoonItems: ComingSoonItem[] = [
  {
    id: 'cs1',
    kind: 'movie',
    title: 'Avatar: Fire and Ash',
    originalTitle: 'Avatar: Fire and Ash',
    imageUrl: IMAGES.movieEpic,
    ageRating: 'PG-13',
    formats: '2D | 3D | IMAX',
    rating: 9.1,
    nextSessionDate: 'JUL 18',
    duration: '3h 12m',
    genres: 'Sci-Fi, Adventure, Action',
    description:
      'The next chapter in the Avatar saga takes Jake and Neytiri into uncharted regions of Pandora, where new clans and ancient threats reshape the future of their world.',
    releaseDate: 'July 18, 2026',
  },
  {
    id: 'cs2',
    kind: 'movie',
    title: 'Wicked: For Good',
    originalTitle: 'Wicked: For Good',
    imageUrl: IMAGES.theaterOpera,
    ageRating: 'PG',
    formats: '2D | SDH',
    rating: 8.7,
    nextSessionDate: 'AUG 8',
    duration: '2h 18m',
    genres: 'Musical, Fantasy, Drama',
    description:
      'The epic conclusion to the untold story of the witches of Oz — a spectacular musical journey of friendship, power, and destiny.',
    releaseDate: 'August 8, 2026',
  },
  {
    id: 'cs3',
    kind: 'event',
    title: 'Taylor Swift | The Eras Tour',
    originalTitle: 'Taylor Swift | The Eras Tour',
    imageUrl: IMAGES.concertFestival,
    ageRating: 'All Ages',
    formats: 'Concert',
    rating: 9.5,
    nextSessionDate: 'SEP 5',
    duration: '3h',
    genres: 'Concert',
    description:
      'The global phenomenon returns to the stage with a brand-new stadium experience featuring hits from every era.',
    venue: 'MetLife Stadium',
    releaseDate: 'September 5, 2026',
  },
  {
    id: 'cs4',
    kind: 'movie',
    title: 'Mission: Impossible 9',
    originalTitle: 'Mission: Impossible — The Final Reckoning',
    imageUrl: IMAGES.movieFilm,
    ageRating: 'PG-13',
    formats: '2D | IMAX',
    rating: 8.4,
    nextSessionDate: 'OCT 3',
    duration: '2h 38m',
    genres: 'Action, Thriller',
    description:
      'Ethan Hunt faces his most dangerous mission yet as a rogue intelligence network threatens to destabilize the entire world.',
    releaseDate: 'October 3, 2026',
  },
  {
    id: 'cs5',
    kind: 'event',
    title: 'Disney on Ice: Magic Kingdom',
    originalTitle: 'Disney on Ice: Magic Kingdom',
    imageUrl: IMAGES.kidsCircus,
    ageRating: 'All Ages',
    formats: 'Family',
    rating: 8.9,
    nextSessionDate: 'NOV 12',
    duration: '2h',
    genres: 'Family',
    description:
      'Beloved Disney characters come to life on ice in a dazzling show for the whole family.',
    venue: 'Barclays Center',
    releaseDate: 'November 12, 2026',
  },
  {
    id: 'cs6',
    kind: 'movie',
    title: 'Gladiator II',
    originalTitle: 'Gladiator II',
    imageUrl: IMAGES.theaterStage,
    ageRating: 'R',
    formats: '2D | SDH',
    rating: 8.3,
    nextSessionDate: 'DEC 20',
    duration: '2h 28m',
    genres: 'Action, Drama, History',
    description:
      'Years after the death of Maximus, a new hero rises in the Colosseum to challenge the corruption of Rome.',
    releaseDate: 'December 20, 2026',
  },
];

export function getComingSoonById(id: string): ComingSoonItem | undefined {
  return comingSoonItems.find((item) => item.id === id);
}
