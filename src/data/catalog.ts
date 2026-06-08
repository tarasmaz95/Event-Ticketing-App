import { movies, getMovieById } from './movies';
import { events, getEventById, type CategoryKey } from './events';
import { comingSoonItems, getComingSoonById } from './comingSoon';

export interface ShowItem {
  id: string;
  kind: 'movie' | 'event';
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
  venue?: string;
  priceFrom?: number;
  priceTo?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  concerts: 'Concert',
  theater: 'Theater',
  kids: 'Family',
  standup: 'Stand-Up',
};

function movieToShowItem(m: (typeof movies)[0]): ShowItem {
  return {
    id: m.id,
    kind: 'movie',
    title: m.title,
    originalTitle: m.originalTitle,
    imageUrl: m.imageUrl,
    ageRating: m.ageRating,
    formats: m.formats,
    rating: m.rating,
    nextSessionDate: m.nextSessionDate,
    duration: m.duration,
    genres: m.genres,
    description: m.description,
    releaseDate: m.releaseDate,
  };
}

function eventToShowItem(e: (typeof events)[0]): ShowItem {
  const label = CATEGORY_LABELS[e.category] ?? 'Event';
  return {
    id: e.id,
    kind: 'event',
    title: e.title,
    originalTitle: e.title,
    imageUrl: e.imageUrl,
    ageRating: e.category === 'kids' ? 'All Ages' : '16+',
    formats: label,
    rating: 8.0 + (e.id.charCodeAt(1) % 10) / 10,
    nextSessionDate: `${e.date.toUpperCase()} · ${e.time}`,
    duration: e.category === 'theater' ? '2h 30m' : '2h',
    genres: label,
    description: `${e.title} — an unforgettable ${label.toLowerCase()} experience at ${e.venue}. Don't miss the live atmosphere and world-class performance.`,
    releaseDate: `${e.date} · ${e.time}`,
    venue: e.venue,
    priceFrom: e.priceFrom,
    priceTo: e.priceTo,
  };
}

function comingSoonToShowItem(item: (typeof comingSoonItems)[0]): ShowItem {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    originalTitle: item.originalTitle,
    imageUrl: item.imageUrl,
    ageRating: item.ageRating,
    formats: item.formats,
    rating: item.rating,
    nextSessionDate: item.nextSessionDate,
    duration: item.duration,
    genres: item.genres,
    description: item.description,
    releaseDate: item.releaseDate,
    venue: item.venue,
  };
}

export function getShowItemById(id: string): ShowItem | undefined {
  const movie = getMovieById(id);
  if (movie) return movieToShowItem(movie);
  const event = getEventById(id);
  if (event) return eventToShowItem(event);
  const soon = getComingSoonById(id);
  if (soon) return comingSoonToShowItem(soon);
  return undefined;
}

export function getComingSoonShowItems(): ShowItem[] {
  return comingSoonItems.map(comingSoonToShowItem);
}

export function getItemsByCategory(category: CategoryKey): ShowItem[] {
  if (category === 'cinema') return movies.map(movieToShowItem);
  if (category === 'home') {
    const topEvents = events.filter((e) => e.top).map(eventToShowItem);
    const featuredMovies = movies.slice(0, 2).map(movieToShowItem);
    return [...topEvents, ...featuredMovies];
  }
  return events.filter((e) => e.category === category).map(eventToShowItem);
}
