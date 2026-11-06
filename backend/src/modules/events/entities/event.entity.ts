import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TypeAcces, StatutEvenement } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Swipe } from '../../swipes/entities/swipe.entity';
import { Participation } from '../../participations/entities/participation.entity';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { AvisEvenement } from '../../reviews/entities/avis-evenement.entity';

@Entity('evenement')
export class Event {
  @PrimaryGeneratedColumn({ name: 'id_evenement' })
  id_evenement: number;

  @Column({ name: 'id_organisateur', type: 'int' })
  id_organisateur: number;

  @ManyToOne(() => User, (user) => user.evenements_organises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_organisateur', referencedColumnName: 'id_utilisateur' })
  organisateur: User;

  @Column({ name: 'titre', type: 'varchar', length: 150 })
  titre: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'date_debut', type: 'timestamp with time zone' })
  date_debut: Date;

  @Column({ name: 'date_fin', type: 'timestamp with time zone' })
  date_fin: Date;

  @Column({ name: 'adresse', type: 'varchar', length: 255 })
  adresse: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Index({ spatial: true })
  @Column({
    name: 'location',
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: any;

  @Column({ name: 'nb_places_max', type: 'int' })
  nb_places_max: number;

  @Column({
    name: 'type_acces',
    type: 'enum',
    enum: TypeAcces,
    default: TypeAcces.PUBLIC,
  })
  type_acces: TypeAcces;

  @Column({
    name: 'statut',
    type: 'enum',
    enum: StatutEvenement,
    default: StatutEvenement.ACTIF,
  })
  statut: StatutEvenement;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamp with time zone' })
  date_creation: Date;

  // Relations
  @ManyToMany(() => Tag, (tag) => tag.events, { cascade: true })
  @JoinTable({
    name: 'evenement_tag',
    joinColumn: { name: 'id_evenement', referencedColumnName: 'id_evenement' },
    inverseJoinColumn: { name: 'id_tag', referencedColumnName: 'id_tag' },
  })
  tags: Tag[];

  @OneToMany(() => Participation, (p) => p.evenement)
  participations: Participation[];

  @OneToMany(() => Swipe, (swipe) => swipe.evenement)
  swipes: Swipe[];

  @OneToMany(() => Announcement, (ann) => ann.evenement)
  annonces: Announcement[];

  @OneToMany(() => AvisEvenement, (avis) => avis.evenement)
  avis: AvisEvenement[];
}
