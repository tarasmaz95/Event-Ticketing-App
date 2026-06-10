import { getApiBase } from './config';
import { fetchWithTimeout } from './fetchWithTimeout';
import type { CategoryKey } from '../data/events';

export interface CatalogEvent {
  id: string;
  category: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  priceFrom: number;
  priceTo: number;
  imageUrl: string;
  top?: boolean;
  description?: string;
}

export interface CatalogMovie {
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

export interface CatalogComingSoon {
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
}

let events: CatalogEvent[] = [];
let movies: CatalogMovie[] = [];
let comingSoon: CatalogComingSoon[] = [];
let loaded = false;

export function isCatalogLoaded(): boolean {
  return loaded;
}

export async function preloadCatalog(): Promise<void> {
  const [evRes, mvRes, csRes] = await Promise.all([
    fetchWithTimeout(`${getApiBase()}/catalog/events`),
    fetchWithTimeout(`${getApiBase()}/catalog/movies`),
    fetchWithTimeout(`${getApiBase()}/catalog/coming-soon`),
  ]);

  if (!evRes.ok || !mvRes.ok || !csRes.ok) {
    throw new Error('Failed to load catalog from API');
  }

  events = await evRes.json();
  movies = await mvRes.json();
  comingSoon = await csRes.json();
  loaded = true;
}

export function getCatalogEvents(): CatalogEvent[] {
  return events;
}

export function getCatalogMovies(): CatalogMovie[] {
  return movies;
}

export function getCatalogComingSoon(): CatalogComingSoon[] {
  return comingSoon;
}

export function getCatalogEventById(id: string): CatalogEvent | undefined {
  return events.find((e) => e.id === id);
}

export function getCatalogMovieById(id: string): CatalogMovie | undefined {
  return movies.find((m) => m.id === id);
}

export function getCatalogComingSoonById(id: string): CatalogComingSoon | undefined {
  return comingSoon.find((c) => c.id === id);
}

const CONCERTS_TOP_IDS = ['c1', 'c2', 'c3'];
const HOME_FEATURED_ID = 'c1';

function sortConcerts(items: CatalogEvent[]): CatalogEvent[] {
  return [...items].sort((a, b) => {
    const aRank = CONCERTS_TOP_IDS.indexOf(a.id);
    const bRank = CONCERTS_TOP_IDS.indexOf(b.id);
    const aOrder = aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank;
    const bOrder = bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.title.localeCompare(b.title);
  });
}

export function getCatalogEventsByCategory(category: CategoryKey): CatalogEvent[] {
  if (category === 'home') {
    const featured = events.filter((e) => e.top);
    const chibuzor = events.find((e) => e.id === HOME_FEATURED_ID);
    const items =
      chibuzor && !featured.some((e) => e.id === HOME_FEATURED_ID)
        ? [chibuzor, ...featured]
        : featured;
    return items.sort((a, b) => {
      if (a.id === HOME_FEATURED_ID) return -1;
      if (b.id === HOME_FEATURED_ID) return 1;
      return 0;
    });
  }
  if (category === 'cinema') return [];
  const items = events.filter((e) => e.category === category);
  if (category === 'concerts') return sortConcerts(items);
  return items;
}
