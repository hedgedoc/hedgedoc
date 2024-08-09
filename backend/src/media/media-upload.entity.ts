/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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

@Entity()
export class MediaUpload {
  /** The unique identifier of a media upload */
  @PrimaryColumn()
  uuid: string;

  /**
   * The note where a media file was uploaded, required for the media browser in the note editor.
   * Can be set to null after creation when the note was deleted without the associated uploads
   */
  @ManyToOne((_) => Note, (note) => note.mediaUploads, {
    nullable: true,
  })
  note: Promise<Note | null>;

  /** The user who uploaded the media file or {@code null} if uploaded by a guest user */
  @ManyToOne((_) => User, (user) => user.mediaUploads, {
    nullable: true,
  })
  user: Promise<User | null>;

  /** The original filename of the media upload */
  @Column()
  fileName: string;

  /** The backend type where this upload is stored */
  @Column({
    nullable: false,
  })
  backendType: string;

  /**
   * Additional data, depending on the backend type, serialized as JSON.
   * This can include for example required additional identifiers for retrieving the file from the backend or to
   * delete the file afterward again.
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  backendData: string | null;

  /** The date when the upload was created */
  @CreateDateColumn()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Create a new media upload entity
   *
   * @param uuid the unique identifier of the upload
   * @param fileName the original filename of the uploaded file
   * @param note the note the upload should be associated with. This is required despite the fact the note field is optional, because it's possible to delete a note without also deleting the associated media uploads, but a note is required for the initial creation.
   * @param user the user that owns the upload
   * @param backendType on which type of media backend the upload is saved
   * @param backendData the backend data returned by the media backend
   */
  public static create(
    uuid: string,
    fileName: string,
    note: Note,
    user: User | null,
    backendType: BackendType,
    backendData: string | null,
  ): Omit<MediaUpload, 'createdAt'> {
    const upload = new MediaUpload();
    upload.uuid = uuid;
    upload.fileName = fileName;
    upload.note = Promise.resolve(note);
    upload.user = Promise.resolve(user);
    upload.backendType = backendType;
    upload.backendData = backendData;
    return upload;
  }
}
