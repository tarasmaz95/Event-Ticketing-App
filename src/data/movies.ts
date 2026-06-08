import { IMAGES } from './images';

export interface Movie {
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
  releaseDate: string;
}

export const movies: Movie[] = [
  {
    id: '1',
    title: 'Minions & Monsters',
    originalTitle: 'Minions & Monsters',
    imageUrl: IMAGES.movieAnimation,
    ageRating: 'PG',
    formats: '2D | 3D | SDH',
    rating: 8.2,
    nextSessionDate: 'JUN 26',
    duration: '1h 25m',
    genres: 'Adventure, Animation, Comedy, Family',
    description:
      'The Minions return in a brand-new adventure! This time they meet extraordinary little monsters who change their lives forever. Together they embark on a wild journey full of friendship, laughter, and chaos at every turn.',
    releaseDate: 'June 26, 2026',
  },
  {
    id: '2',
    title: 'The Neighbors Upstairs',
    originalTitle: 'The Neighbors Upstairs',
    imageUrl: IMAGES.movieCinema,
    ageRating: 'R',
    formats: '2D | SDH',
    rating: 7.4,
    nextSessionDate: 'JUN 18',
    duration: '1h 48m',
    genres: 'Comedy, Drama',
    description:
      'A quiet family of three suddenly discovers that a loud crew has moved in upstairs with no boundaries. Every night brings parties, music, and unexpected neighbors who change everything.',
    releaseDate: 'June 18, 2026',
  },
  {
    id: '3',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    imageUrl: IMAGES.movieEpic,
    ageRating: 'PG-13',
    formats: '2D | IMAX',
    rating: 8.8,
    nextSessionDate: 'JUN 20',
    duration: '2h 46m',
    genres: 'Sci-Fi, Adventure, Drama',
    description:
      'Paul Atreides unites with Chani and the Fremen to avenge the destruction of his family. He must choose between the love of his life and the fate of the known universe.',
    releaseDate: 'June 20, 2026',
  },
  {
    id: '4',
    title: 'Midnight in Paris',
    originalTitle: 'Midnight in Paris',
    imageUrl: IMAGES.movieFilm,
    ageRating: 'PG-13',
    formats: '2D | SDH',
    rating: 8.0,
    nextSessionDate: 'JUN 24',
    duration: '1h 34m',
    genres: 'Romance, Fantasy, Comedy',
    description:
      'A nostalgic screenwriter finds himself mysteriously transported to 1920s Paris every night at midnight, where he encounters legendary artists and writers who inspire him to rethink his life.',
    releaseDate: 'June 24, 2026',
  },
];

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}
