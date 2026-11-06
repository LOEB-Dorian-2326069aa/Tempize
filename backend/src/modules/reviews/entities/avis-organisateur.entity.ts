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

@Entity('avis_organisateur')
@Index(['id_auteur', 'id_organisateur'], { unique: true })
export class AvisOrganisateur {
  @PrimaryColumn({ name: 'id_auteur', type: 'int' })
  id_auteur: number;

  @PrimaryColumn({ name: 'id_organisateur', type: 'int' })
  id_organisateur: number;

  @ManyToOne(() => User, (user) => user.avis_organisateurs_donnes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_auteur', referencedColumnName: 'id_utilisateur' })
  auteur: User;

  @ManyToOne(() => User, (user) => user.avis_organisateurs_recus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_organisateur', referencedColumnName: 'id_utilisateur' })
  organisateur: User;

  @Column({ name: 'note_organisateur', type: 'smallint' })
  note_organisateur: number;

  @Column({ name: 'commentaire', type: 'text', nullable: true })
  commentaire: string;

  @CreateDateColumn({ name: 'date_avis', type: 'timestamp with time zone' })
  date_avis: Date;
}
