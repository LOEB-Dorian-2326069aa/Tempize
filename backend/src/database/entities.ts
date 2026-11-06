import { User } from '../modules/users/entities/user.entity';
import { Tag } from '../modules/tags/entities/tag.entity';
import { Event } from '../modules/events/entities/event.entity';
import { Swipe } from '../modules/swipes/entities/swipe.entity';
import { Participation } from '../modules/participations/entities/participation.entity';
import { Announcement } from '../modules/announcements/entities/announcement.entity';
import { AvisEvenement } from '../modules/reviews/entities/avis-evenement.entity';
import { AvisOrganisateur } from '../modules/reviews/entities/avis-organisateur.entity';

export const entities = [
  User,
  Tag,
  Event,
  Swipe,
  Participation,
  Announcement,
  AvisEvenement,
  AvisOrganisateur,
];

export {
  User,
  Tag,
  Event,
  Swipe,
  Participation,
  Announcement,
  AvisEvenement,
  AvisOrganisateur,
};
