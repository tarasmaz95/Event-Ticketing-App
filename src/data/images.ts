/** Verified working Unsplash URLs (tested HTTP 200) */
const Q = '?w=800&h=450&fit=crop&auto=format&q=80';

function img(id: string): string {
  return `https://images.unsplash.com/${id}${Q}`;
}

type LocalAsset = number | { uri: string };

function localImg(asset: LocalAsset): string {
  if (typeof asset === 'object' && asset.uri) {
    return asset.uri;
  }

  const { Image } = require('react-native') as typeof import('react-native');
  return Image.resolveAssetSource(asset).uri;
}

export const IMAGES = {
  // Concerts — Chibuzor Okoye
  chibuzorLead: localImg(require('../../assets/concert-chibuzor-1.png')),
  chibuzorKeynote: localImg(require('../../assets/concert-chibuzor-2.png')),
  chibuzorImpact: localImg(require('../../assets/concert-chibuzor-3.png')),
  concertCrowd: img('photo-1470229722913-7c0e2dbbafd3'),
  concertSinger: img('photo-1493225457124-a3eb161ffa5f'),
  concertFestival: img('photo-1514525253161-7a46d19cd819'),
  concertJazz: img('photo-1511671782779-c97d3d27a1d4'),
  concertOutdoor: img('photo-1501281668745-f7f57925c3b4'),

  // Theater
  theaterStage: img('photo-1585699324551-f6c309eedeca'),
  theaterOpera: img('photo-1514306191717-452ec28c7814'),
  theaterSeats: img('photo-1503676260728-1c00da094a0b'),
  theaterMic: img('photo-1516280440614-37939bbacd81'),

  // Kids
  kidsParty: img('photo-1516627145497-ae6968895b74'),
  kidsBalloons: img('photo-1530103862676-de8c9debad1d'),
  kidsCircus: img('photo-1516450360452-9312f5e86fc7'),
  kidsCelebration: img('photo-1511795409834-ef04bbd61622'),

  // Stand-up
  standupStage: img('photo-1492684223066-81342ee5ff30'),
  standupSpotlight: img('photo-1587825140708-dfaf72ae4b04'),
  standupCrowd: img('photo-1540039155733-5bb30b53aa14'),
  standupLaugh: img('photo-1529156069898-49953e39b3ac'),

  // Cinema
  movieAnimation: img('photo-1558618666-fcd25c85cd64'),
  movieCinema: img('photo-1489599849927-2ee91cede3ba'),
  movieEpic: img('photo-1536440136628-849c177e76a1'),
  movieFilm: img('photo-1440404653325-ab127d49abc1'),

  // Venues
  venueMall: img('photo-1501386761578-eac5c94b800a'),
  venueClassic: img('photo-1507003211169-0a1dd7228f2d'),
} as const;

export function fallbackImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;
}
