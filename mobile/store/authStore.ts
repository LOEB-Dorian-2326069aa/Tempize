import { create } from 'zustand';
import { api, setAuthToken } from '../services/api';

export interface Tag {
  id_tag: number;
  libelle: string;
}

export interface UserProfile {
  id_utilisateur: number;
  prenom?: string;
  nom?: string;
  pseudo?: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  est_premium: boolean;
  date_fin_premium?: string | null;
  tags?: Tag[];
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  location: { latitude: number; longitude: number };

  login: (email: string, mot_de_passe: string) => Promise<void>;
  register: (data: {
    prenom: string;
    nom?: string;
    pseudo?: string;
    email: string;
    mot_de_passe: string;
    bio?: string;
    tag_ids?: number[];
  }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setLocation: (lat: number, lng: number) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // Coordonnées par défaut : Lyon (Place Bellecour)
  location: { latitude: 45.757814, longitude: 4.832011 },

  login: async (email: string, mot_de_passe: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ access_token: string; user: UserProfile }>(
        '/auth/login',
        { email, mot_de_passe },
      );
      setAuthToken(res.access_token);
      set({
        token: res.access_token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const loc = get().location;
      const res = await api.post<{ access_token: string; user: UserProfile }>(
        '/auth/register',
        {
          ...data,
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      );
      setAuthToken(res.access_token);
      set({
        token: res.access_token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const user = await api.get<UserProfile>('/auth/me');
      set({ user });
    } catch {
      get().logout();
    }
  },

  setLocation: (latitude: number, longitude: number) => {
    set({ location: { latitude, longitude } });
  },

  clearError: () => set({ error: null }),
}));
