import { ParkingSpotWithStatus } from '../Types/parking';

export interface FavoriteSpot {
  id: string;
  spot: ParkingSpotWithStatus;
  dateAdded: string;
  nickname?: string;
}

export class FavoritesService {
  private readonly STORAGE_KEY = 'parking_favorites';
  private readonly MAX_FAVORITES = 50;

  /**
   * Get all favorite parking spots
   */
  getFavorites(): FavoriteSpot[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const favorites: FavoriteSpot[] = JSON.parse(stored);
      
      // Validate and clean up invalid entries
      return favorites.filter(fav => 
        fav.id && 
        fav.spot && 
        fav.spot.code_achoza && 
        fav.dateAdded
      );
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  /**
   * Add a parking spot to favorites
   */
  addToFavorites(spot: ParkingSpotWithStatus, nickname?: string): boolean {
    try {
      const favorites = this.getFavorites();
      const spotId = spot.code_achoza.toString();
      
      // Check if already in favorites
      if (this.isFavorite(spotId)) {
        return false;
      }

      // Check maximum limit
      if (favorites.length >= this.MAX_FAVORITES) {
        throw new Error(`Maximum ${this.MAX_FAVORITES} favorites allowed`);
      }

      const newFavorite: FavoriteSpot = {
        id: spotId,
        spot: spot,
        dateAdded: new Date().toISOString(),
        nickname: nickname
      };

      favorites.push(newFavorite);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove a parking spot from favorites
   */
  removeFromFavorites(spotId: string): boolean {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(fav => fav.id !== spotId);
      
      if (filteredFavorites.length === favorites.length) {
        return false; // Not found
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFavorites));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Check if a parking spot is in favorites
   */
  isFavorite(spotId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === spotId);
  }

  /**
   * Update nickname for a favorite spot
   */
  updateNickname(spotId: string, nickname: string): boolean {
    try {
      const favorites = this.getFavorites();
      const favoriteIndex = favorites.findIndex(fav => fav.id === spotId);
      
      if (favoriteIndex === -1) {
        return false;
      }

      favorites[favoriteIndex].nickname = nickname.trim() || undefined;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      
      return true;
    } catch (error) {
      console.error('Error updating nickname:', error);
      return false;
    }
  }

  /**
   * Get favorite spots sorted by date added (newest first)
   */
  getFavoritesSorted(): FavoriteSpot[] {
    return this.getFavorites().sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  }

  /**
   * Clear all favorites
   */
  clearAllFavorites(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }

  /**
   * Get favorites count
   */
  getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  /**
   * Export favorites for backup
   */
  exportFavorites(): string {
    try {
      const favorites = this.getFavorites();
      return JSON.stringify(favorites, null, 2);
    } catch (error) {
      console.error('Error exporting favorites:', error);
      throw error;
    }
  }

  /**
   * Import favorites from backup
   */
  importFavorites(favoritesJson: string): boolean {
    try {
      const favorites: FavoriteSpot[] = JSON.parse(favoritesJson);
      
      // Validate structure
      if (!Array.isArray(favorites)) {
        throw new Error('Invalid favorites format');
      }

      // Validate each favorite
      const validFavorites = favorites.filter(fav => 
        fav.id && 
        fav.spot && 
        fav.spot.code_achoza && 
        fav.dateAdded
      );

      if (validFavorites.length > this.MAX_FAVORITES) {
        throw new Error(`Too many favorites. Maximum ${this.MAX_FAVORITES} allowed.`);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validFavorites));
      return true;
    } catch (error) {
      console.error('Error importing favorites:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
