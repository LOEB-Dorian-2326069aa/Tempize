import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { StatutParticipation } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('participation')
@Index(['id_utilisateur', 'id_evenement'], { unique: true })
export class Participation {
  @PrimaryColumn({ name: 'id_utilisateur', type: 'int' })
  id_utilisateur: number;

  @PrimaryColumn({ name: 'id_evenement', type: 'int' })
  id_evenement: number;

  @ManyToOne(() => User, (user) => user.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_utilisateur', referencedColumnName: 'id_utilisateur' })
  utilisateur: User;

  @ManyToOne(() => Event, (event) => event.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_evenement', referencedColumnName: 'id_evenement' })
  evenement: Event;

  @Column({
    name: 'statut_participation',
    type: 'enum',
    enum: StatutParticipation,
    default: StatutParticipation.EN_ATTENTE,
  })
  statut_participation: StatutParticipation;

  @CreateDateColumn({ name: 'date_demande', type: 'timestamp with time zone' })
  date_demande: Date;

  @Column({ name: 'date_reponse', type: 'timestamp with time zone', nullable: true })
  date_reponse: Date;

  @Column({ name: 'est_prioritaire', type: 'boolean', default: false })
  est_prioritaire: boolean;
}
