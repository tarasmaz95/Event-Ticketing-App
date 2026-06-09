import { API_BASE } from './config';
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
    fetchWithTimeout(`${API_BASE}/catalog/events`),
    fetchWithTimeout(`${API_BASE}/catalog/movies`),
    fetchWithTimeout(`${API_BASE}/catalog/coming-soon`),
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

export function getCatalogEventsByCategory(category: CategoryKey): CatalogEvent[] {
  if (category === 'home') return events.filter((e) => e.top);
  if (category === 'cinema') return [];
  return events.filter((e) => e.category === category);
}
