import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FavoriteSpot, favoritesService } from '../Services/favoritesService';
import { ParkingSpotWithStatus } from '../Types/parking';

interface FavoritesContextType {
  favorites: FavoriteSpot[];
  favoritesCount: number;
  isFavorite: (spotId: string) => boolean;
  addToFavorites: (spot: ParkingSpotWithStatus, nickname?: string) => Promise<boolean>;
  removeFromFavorites: (spotId: string) => Promise<boolean>;
  updateNickname: (spotId: string, nickname: string) => Promise<boolean>;
  toggleFavorite: (spot: ParkingSpotWithStatus) => Promise<boolean>;
  clearAllFavorites: () => void;
  refreshFavorites: () => void;
  exportFavorites: () => string;
  importFavorites: (data: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);

  // Load favorites on mount
  useEffect(() => {
    refreshFavorites();
  }, []);

  const refreshFavorites = useCallback(() => {
    const loadedFavorites = favoritesService.getFavoritesSorted();
    setFavorites(loadedFavorites);
  }, []);

  const isFavorite = useCallback((spotId: string): boolean => {
    return favoritesService.isFavorite(spotId);
  }, []);

  const addToFavorites = useCallback(async (spot: ParkingSpotWithStatus, nickname?: string): Promise<boolean> => {
    try {
      const success = favoritesService.addToFavorites(spot, nickname);
      if (success) {
        refreshFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }, [refreshFavorites]);

  const removeFromFavorites = useCallback(async (spotId: string): Promise<boolean> => {
    try {
      const success = favoritesService.removeFromFavorites(spotId);
      if (success) {
        refreshFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return false;
    }
  }, [refreshFavorites]);

  const updateNickname = useCallback(async (spotId: string, nickname: string): Promise<boolean> => {
    try {
      const success = favoritesService.updateNickname(spotId, nickname);
      if (success) {
        refreshFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to update nickname:', error);
      return false;
    }
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(async (spot: ParkingSpotWithStatus): Promise<boolean> => {
    const spotId = spot.code_achoza.toString();
    
    if (isFavorite(spotId)) {
      return await removeFromFavorites(spotId);
    } else {
      return await addToFavorites(spot);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const clearAllFavorites = useCallback(() => {
    favoritesService.clearAllFavorites();
    refreshFavorites();
  }, [refreshFavorites]);

  const exportFavorites = useCallback((): string => {
    return favoritesService.exportFavorites();
  }, []);

  const importFavorites = useCallback(async (data: string): Promise<boolean> => {
    try {
      const success = favoritesService.importFavorites(data);
      if (success) {
        refreshFavorites();
      }
      return success;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      throw error;
    }
  }, [refreshFavorites]);

  const favoritesCount = favorites.length;

  const value: FavoritesContextType = {
    favorites,
    favoritesCount,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    updateNickname,
    toggleFavorite,
    clearAllFavorites,
    refreshFavorites,
    exportFavorites,
    importFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
