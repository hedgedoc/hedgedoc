import { generate as shortIdGenerate } from 'shortid';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Author } from '../authors/author.entity';
import { Revision } from '../revisions/revision.entity';
import { User } from '../users/user.entity';

// permission types
enum PermissionEnum {
  freely = 'freely',
  editable = 'editable',
  limited = 'limited',
  locked = 'locked',
  protected = 'protected',
  private = 'private',
}

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

  @Column({
    type: 'text',
  })
  permission: PermissionEnum;

  @Column({
    nullable: false,
    default: 0,
  })
  viewcount: number;

  @Column({
    nullable: true,
  })
  lastchangeAt: Date;

  @Column()
  savedAt: Date;

  @ManyToOne(_ => User, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(_ => User)
  lastchangeuser: User;

  @OneToMany(
    _ => Revision,
    revision => revision.note,
  )
  revisions: Revision[];

  @OneToMany(
    _ => Author,
    author => author.note,
  )
  authors: Author[];

  @Column({
    type: 'text',
    nullable: true,
  })
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  authorship: string;

  constructor(
    shortid: string,
    alias: string,
    permission: PermissionEnum,
    lastchangeAt: Date,
    savedAt: Date,
    owner: User,
    title: string,
    content: string,
    authorship: string,
  ) {
    if (shortid) {
      this.shortid = shortid;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.shortid = shortIdGenerate() as string;
    }
    this.alias = alias;
    this.permission = permission;
    this.lastchangeAt = lastchangeAt;
    this.savedAt = savedAt;
    this.owner = owner;
    this.title = title;
    this.content = content;
    this.authorship = authorship;
  }
}
