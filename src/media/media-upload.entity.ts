import * as crypto from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
export class MediaUpload {
  @PrimaryColumn()
  id: string;

  @ManyToOne(_ => Note, { nullable: false })
  note: Note;

  @ManyToOne(_ => User, { nullable: false })
  user: User;

  @Column({
    nullable: false,
  })
  extension: string;

  @Column({
    nullable: false,
  })
  backendType: string;

  @Column({
    nullable: true,
  })
  backendData: string | null;

  @CreateDateColumn()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    note: Note,
    user: User,
    extension: string,
    backendType: string,
    backendData?: string,
  ): MediaUpload {
    const upload = new MediaUpload();
    const randomBytes = crypto.randomBytes(16);
    upload.id = randomBytes.toString('hex');
    upload.note = note;
    upload.user = user;
    upload.extension = extension;
    upload.backendType = backendType;
    if (backendData) {
      upload.backendData = backendData;
    } else {
      upload.backendData = null;
    }
    return upload;
  }
}
