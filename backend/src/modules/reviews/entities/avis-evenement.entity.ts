import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('avis_evenement')
@Index(['id_utilisateur', 'id_evenement'], { unique: true })
export class AvisEvenement {
  @PrimaryColumn({ name: 'id_utilisateur', type: 'int' })
  id_utilisateur: number;

  @PrimaryColumn({ name: 'id_evenement', type: 'int' })
  id_evenement: number;

  @ManyToOne(() => User, (user) => user.avis_evenements_donnes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_utilisateur', referencedColumnName: 'id_utilisateur' })
  utilisateur: User;

  @ManyToOne(() => Event, (event) => event.avis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_evenement', referencedColumnName: 'id_evenement' })
  evenement: Event;

  @Column({ name: 'note_evenement', type: 'smallint' })
  note_evenement: number;

  @Column({ name: 'commentaire', type: 'text', nullable: true })
  commentaire: string;

  @CreateDateColumn({ name: 'date_avis', type: 'timestamp with time zone' })
  date_avis: Date;
}
