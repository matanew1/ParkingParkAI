import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ParkingSpotWithStatus } from "../Types/parking";

export interface FavoriteSpot {
  id: string;
  spot: ParkingSpotWithStatus;
  nickname?: string;
  addedAt: Date;
}

export interface FavoritesState {
  favorites: FavoriteSpot[];
  favoritesCount: number;
  addFavorite: (spot: ParkingSpotWithStatus, nickname?: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (spot: ParkingSpotWithStatus, nickname?: string) => void;
  updateNickname: (id: string, nickname: string) => void;
  isFavorite: (id: string) => boolean;
  getFavorite: (id: string) => FavoriteSpot | undefined;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoritesCount: 0,

      addFavorite: (spot: ParkingSpotWithStatus, nickname?: string) => {
        const id = spot.code_achoza.toString();
        if (get().isFavorite(id)) return;

        const newFavorite: FavoriteSpot = {
          id,
          spot,
          nickname,
          addedAt: new Date(),
        };

        set((state) => ({
          favorites: [...state.favorites, newFavorite],
          favoritesCount: state.favoritesCount + 1,
        }));
      },

      removeFavorite: (id: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== id),
          favoritesCount: state.favoritesCount - 1,
        }));
      },

      toggleFavorite: (spot: ParkingSpotWithStatus, nickname?: string) => {
        const id = spot.code_achoza.toString();
        if (get().isFavorite(id)) {
          get().removeFavorite(id);
        } else {
          get().addFavorite(spot, nickname);
        }
      },

      updateNickname: (id: string, nickname: string) => {
        set((state) => ({
          favorites: state.favorites.map((fav) =>
            fav.id === id ? { ...fav, nickname } : fav
          ),
        }));
      },

      isFavorite: (id: string) => {
        return get().favorites.some((fav) => fav.id === id);
      },

      getFavorite: (id: string) => {
        return get().favorites.find((fav) => fav.id === id);
      },

      clearFavorites: () => {
        set({ favorites: [], favoritesCount: 0 });
      },
    }),
    {
      name: "favorites-storage",
    }
  )
);
