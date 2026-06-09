import type { CategoryKey } from './events';
import {
  getCatalogComingSoon,
  getCatalogComingSoonById,
  getCatalogEventById,
  getCatalogEventsByCategory,
  getCatalogMovieById,
  getCatalogMovies,
} from '../lib/catalogApi';

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

function movieToShowItem(m: {
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
}): ShowItem {
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

function eventToShowItem(e: {
  id: string;
  category: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  priceFrom: number;
  priceTo: number;
  imageUrl: string;
  description?: string;
}): ShowItem {
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
    description:
      e.description ||
      `${e.title} — an unforgettable ${label.toLowerCase()} experience at ${e.venue}.`,
    releaseDate: `${e.date} · ${e.time}`,
    venue: e.venue,
    priceFrom: e.priceFrom,
    priceTo: e.priceTo,
  };
}

function comingSoonToShowItem(item: {
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
}): ShowItem {
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
  const movie = getCatalogMovieById(id);
  if (movie) return movieToShowItem(movie);
  const event = getCatalogEventById(id);
  if (event) return eventToShowItem(event);
  const soon = getCatalogComingSoonById(id);
  if (soon) return comingSoonToShowItem(soon);
  return undefined;
}

export function getComingSoonShowItems(): ShowItem[] {
  return getCatalogComingSoon().map(comingSoonToShowItem);
}

export function getItemsByCategory(category: CategoryKey): ShowItem[] {
  if (category === 'cinema') return getCatalogMovies().map(movieToShowItem);
  if (category === 'home') {
    const topEvents = getCatalogEventsByCategory('home').map(eventToShowItem);
    const featuredMovies = getCatalogMovies().slice(0, 2).map(movieToShowItem);
    return [...topEvents, ...featuredMovies];
  }
  return getCatalogEventsByCategory(category).map(eventToShowItem);
}
