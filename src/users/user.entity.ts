import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column, OneToMany } from 'typeorm/index';
import { Note } from '../notes/note.entity';
import { AuthToken } from './auth-token.entity';
import { Identity } from './identity.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  displayName: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  photo?: string;

  @Column({
    nullable: true,
  })
  email?: string;

  @OneToMany(
    _ => Note,
    note => note.owner,
  )
  ownedNotes: Note[];

  @OneToMany(
    _ => AuthToken,
    authToken => authToken.user,
  )
  authToken: AuthToken[];

  @OneToMany(
    _ => Identity,
    identity => identity.user,
  )
  identities: Identity[];
}
