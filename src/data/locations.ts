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

export const cities: City[] = [
  {
    id: 'nyc',
    name: 'NEW YORK',
    venues: [
      { id: 'hudson-point', name: 'HUDSON POINT', address: '415 West 42nd St, Manhattan' },
    ],
  },
];

export interface SelectedLocation {
  cityId: string;
  venueId: string;
}

export const DEFAULT_LOCATION: SelectedLocation = {
  cityId: 'nyc',
  venueId: 'hudson-point',
};

export function getLocationLabel(loc: SelectedLocation): string {
  const city = cities.find((c) => c.id === loc.cityId);
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
