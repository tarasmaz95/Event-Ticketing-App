import { preloadCatalog } from './catalogApi';
import { preloadLocations } from './locationsApi';

export async function preloadApp(): Promise<void> {
  await Promise.all([preloadCatalog(), preloadLocations()]);
}
