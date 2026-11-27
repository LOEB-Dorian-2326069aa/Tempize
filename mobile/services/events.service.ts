import { api } from './api';
import { Tag } from '../store/authStore';

export interface FeedEvent {
  id_evenement: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  adresse: string;
  latitude: number;
  longitude: number;
  nb_places_max: number;
  places_restantes: number;
  distance: string;
  distance_metres: number;
  matching_tags_count: number;
  type_acces: 'public' | 'sur_validation';
  statut: string;
  tags?: Tag[];
  organisateur?: {
    id_utilisateur: number;
    pseudo: string;
    photo?: string | null;
  };
}

export interface CreateEventPayload {
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  adresse: string;
  latitude: number;
  longitude: number;
  nb_places_max: number;
  type_acces?: 'public' | 'sur_validation';
  tag_ids?: number[];
}

export interface SwipeResponse {
  action: 'like' | 'pass';
  id_evenement: number;
  statut_participation?: string;
  est_prioritaire?: boolean;
  message: string;
}

export const eventsService = {
  getFeed: async (lat: number, lng: number, radius = 15): Promise<FeedEvent[]> => {
    return api.get<FeedEvent[]>('/events/feed', {
      params: { latitude: lat, longitude: lng, radius },
    });
  },

  createEvent: async (data: CreateEventPayload): Promise<FeedEvent> => {
    return api.post<FeedEvent>('/events', data);
  },

  swipe: async (
    eventId: number,
    direction: 'droite' | 'gauche',
  ): Promise<SwipeResponse> => {
    return api.post<SwipeResponse>('/swipes', {
      id_evenement: eventId,
      direction,
    });
  },

  rewind: async (): Promise<{ message: string; id_evenement: number }> => {
    return api.post<{ message: string; id_evenement: number }>('/swipes/rewind');
  },

  getMyEvents: async () => {
    return api.get<{
      organises: FeedEvent[];
      participations: Array<{
        statut: string;
        date_demande: string;
        est_prioritaire: boolean;
        evenement: FeedEvent;
      }>;
    }>('/events/my-events');
  },

  getTags: async (): Promise<Tag[]> => {
    return api.get<Tag[]>('/tags');
  },

  getAnnouncements: async (eventId: number) => {
    return api.get<
      Array<{
        id_annonce: number;
        contenu: string;
        date_publication: string;
      }>
    >(`/announcements/event/${eventId}`);
  },

  createAnnouncement: async (eventId: number, contenu: string) => {
    return api.post('/announcements', { id_evenement: eventId, contenu });
  },
};

