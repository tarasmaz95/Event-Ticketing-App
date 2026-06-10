import { getApiBase } from './config';
import { fetchWithTimeout } from './fetchWithTimeout';

export interface Venue {
  id: string;
  name: string;
  address: string;
}

export interface City {
  id: string;
  name: string;
  venues: Venue[];
}

export interface SelectedLocation {
  cityId: string;
  venueId: string;
}

interface LocationsData {
  cities: City[];
  defaultLocation: SelectedLocation;
}

let data: LocationsData | null = null;

export function isLocationsLoaded(): boolean {
  return data !== null;
}

export async function preloadLocations(): Promise<void> {
  const res = await fetchWithTimeout(`${getApiBase()}/locations`);
  if (!res.ok) throw new Error('Failed to load locations');
  data = await res.json();
}

export function getCities(): City[] {
  return data?.cities ?? [];
}

export function getDefaultLocation(): SelectedLocation {
  return data?.defaultLocation ?? { cityId: 'nyc', venueId: 'hudson-point' };
}

export function getLocationLabel(loc: SelectedLocation): string {
  const city = getCities().find((c) => c.id === loc.cityId);
  const venue = city?.venues.find((v) => v.id === loc.venueId);
  if (!city || !venue) return 'New York, Hudson Point';
  const venueName = venue.name
    .split(' ')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
  const cityName = city.name
    .split(' ')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
  return `${cityName}, ${venueName}`;
}
