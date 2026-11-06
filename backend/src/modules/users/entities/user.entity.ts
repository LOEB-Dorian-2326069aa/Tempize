import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Tag } from '../../tags/entities/tag.entity';
import { Event } from '../../events/entities/event.entity';
import { Swipe } from '../../swipes/entities/swipe.entity';
import { Participation } from '../../participations/entities/participation.entity';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { AvisEvenement } from '../../reviews/entities/avis-evenement.entity';
import { AvisOrganisateur } from '../../reviews/entities/avis-organisateur.entity';

@Entity('utilisateur')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_utilisateur' })
  id_utilisateur: number;

  @Column({ name: 'pseudo', type: 'varchar', length: 50, unique: true })
  pseudo: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'mot_de_passe', type: 'varchar', length: 255, select: false })
  mot_de_passe: string;

  @Column({ name: 'date_naissance', type: 'date', nullable: true })
  date_naissance: Date;

  @Column({ name: 'photo', type: 'varchar', length: 255, nullable: true })
  photo: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Index({ spatial: true })
  @Column({
    name: 'location',
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;

  @Column({ name: 'est_premium', type: 'boolean', default: false })
  est_premium: boolean;

  @Column({ name: 'date_fin_premium', type: 'timestamp with time zone', nullable: true })
  date_fin_premium: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations
  @ManyToMany(() => Tag, (tag) => tag.users, { cascade: true })
  @JoinTable({
    name: 'utilisateur_tag',
    joinColumn: { name: 'id_utilisateur', referencedColumnName: 'id_utilisateur' },
    inverseJoinColumn: { name: 'id_tag', referencedColumnName: 'id_tag' },
  })
  tags: Tag[];

  @OneToMany(() => Event, (event) => event.organisateur)
  evenements_organises: Event[];

  @OneToMany(() => Swipe, (swipe) => swipe.utilisateur)
  swipes: Swipe[];

  @OneToMany(() => Participation, (p) => p.utilisateur)
  participations: Participation[];

  @OneToMany(() => Announcement, (ann) => ann.organisateur)
  annonces: Announcement[];

  @OneToMany(() => AvisEvenement, (avis) => avis.utilisateur)
  avis_evenements_donnes: AvisEvenement[];

  @OneToMany(() => AvisOrganisateur, (avis) => avis.auteur)
  avis_organisateurs_donnes: AvisOrganisateur[];

  @OneToMany(() => AvisOrganisateur, (avis) => avis.organisateur)
  avis_organisateurs_recus: AvisOrganisateur[];
}
