import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DirectionSwipe } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('swipe')
@Index(['id_utilisateur', 'id_evenement'], { unique: true })
export class Swipe {
  @PrimaryColumn({ name: 'id_utilisateur', type: 'int' })
  id_utilisateur: number;

  @PrimaryColumn({ name: 'id_evenement', type: 'int' })
  id_evenement: number;

  @ManyToOne(() => User, (user) => user.swipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_utilisateur', referencedColumnName: 'id_utilisateur' })
  utilisateur: User;

  @ManyToOne(() => Event, (event) => event.swipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_evenement', referencedColumnName: 'id_evenement' })
  evenement: Event;

  @Column({
    name: 'direction',
    type: 'enum',
    enum: DirectionSwipe,
  })
  direction: DirectionSwipe;

  @CreateDateColumn({ name: 'date_swipe', type: 'timestamp with time zone' })
  date_swipe: Date;

  @Column({ name: 'date_reapparition', type: 'timestamp with time zone', nullable: true })
  date_reapparition: Date;
}
