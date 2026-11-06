import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('annonce')
export class Announcement {
  @PrimaryGeneratedColumn({ name: 'id_annonce' })
  id_annonce: number;

  @Column({ name: 'id_evenement', type: 'int' })
  id_evenement: number;

  @ManyToOne(() => Event, (event) => event.annonces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_evenement', referencedColumnName: 'id_evenement' })
  evenement: Event;

  @Column({ name: 'id_organisateur', type: 'int' })
  id_organisateur: number;

  @ManyToOne(() => User, (user) => user.annonces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_organisateur', referencedColumnName: 'id_utilisateur' })
  organisateur: User;

  @Column({ name: 'contenu', type: 'text' })
  contenu: string;

  @CreateDateColumn({ name: 'date_publication', type: 'timestamp with time zone' })
  date_publication: Date;
}
