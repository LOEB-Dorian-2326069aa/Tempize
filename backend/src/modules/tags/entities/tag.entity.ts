import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn({ name: 'id_tag' })
  id_tag: number;

  @Column({ name: 'libelle', type: 'varchar', length: 50, unique: true })
  libelle: string;

  @ManyToMany(() => User, (user) => user.tags)
  users: User[];

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];
}
