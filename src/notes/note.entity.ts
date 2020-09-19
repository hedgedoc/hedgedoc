import { generate as shortIdGenerate } from 'shortid';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Revision } from '../revisions/revision.entity';
import { User } from '../users/user.entity';
import { AuthorColor } from './author-color.entity';

@Entity('Notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    nullable: false,
    unique: true,
  })
  shortid: string;
  @Column({
    unique: true,
    nullable: true,
  })
  alias: string;
  @OneToMany(
    _ => NoteGroupPermission,
    groupPermission => groupPermission.note,
  )
  groupPermissions: NoteGroupPermission[];
  @OneToMany(
    _ => NoteUserPermission,
    userPermission => userPermission.note,
  )
  userPermissions: NoteUserPermission[];
  @Column({
    nullable: false,
    default: 0,
  })
  viewcount: number;
  @ManyToOne(
    _ => User,
    user => user.ownedNotes,
    { onDelete: 'CASCADE' },
  )
  owner: User;
  @OneToMany(
    _ => Revision,
    revision => revision.note,
    { cascade: true },
  )
  revisions: Revision[];
  @OneToMany(
    _ => AuthorColor,
    authorColor => authorColor.note,
  )
  authorColors: AuthorColor[];

  constructor(shortid: string, alias: string, owner: User) {
    if (shortid) {
      this.shortid = shortid;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.shortid = shortIdGenerate() as string;
    }
    this.alias = alias;
    this.owner = owner;
  }
}
