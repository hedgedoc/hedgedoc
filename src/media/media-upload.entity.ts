/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { BackendType } from './backends/backend-type.enum';

export type BackendData = string | null;

@Entity()
export class MediaUpload {
  @PrimaryColumn()
  id: string;

  @ManyToOne((_) => Note, (note) => note.mediaUploads, {
    nullable: true,
  })
  note: Promise<Note | null>;

  @ManyToOne((_) => User, (user) => user.mediaUploads, {
    nullable: false,
  })
  user: Promise<User>;

  @Column({
    nullable: false,
  })
  backendType: string;

  @Column()
  fileUrl: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  backendData: BackendData | null;

  @CreateDateColumn()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Create a new media upload enity
   * @param id the id of the upload
   * @param note the note the upload should be associated with. This is required despite the fact the note field is optional, because it's possible to delete a note without also deleting the associated media uploads, but a note is required for the initial creation.
   * @param user the user that owns the upload
   * @param extension which file extension the upload has
   * @param backendType on which type of media backend the upload is saved
   * @param backendData the backend data returned by the media backend
   * @param fileUrl the url where the upload can be accessed
   */
  public static create(
    id: string,
    note: Note,
    user: User,
    extension: string,
    backendType: BackendType,
    fileUrl: string,
  ): Omit<MediaUpload, 'createdAt'> {
    const upload = new MediaUpload();
    upload.id = id;
    upload.note = Promise.resolve(note);
    upload.user = Promise.resolve(user);
    upload.backendType = backendType;
    upload.backendData = null;
    upload.fileUrl = fileUrl;
    return upload;
  }
}
