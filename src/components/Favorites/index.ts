// Export all favorites components
export { default as FavoritesList } from './FavoritesList';
export { default as FavoriteToggleButton } from './FavoriteToggleButton';

// Export favorites context and service
export { FavoritesProvider, useFavorites } from '../Context/FavoritesContext';
export { favoritesService } from '../Services/favoritesService';
export type { FavoriteSpot } from '../Services/favoritesService';
