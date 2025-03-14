/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BackendType } from '../../media/backends/backend-type.enum';

/**
 * A media upload object represents an uploaded file. While the file itself is stored in the configured storage backend,
 * the metadata is stored in the database. Uploads are attached to the {@link Note} where they were uploaded, but can be
 * detached by deleting the note and setting the option to keep the media files.
 */
export interface MediaUpload {
  /** UUID (v7) identifying the media upload. Is public and unique */
  [FieldNameMediaUpload.uuid]: string;

  /** The id of the attached {@link Note} or null if the media upload was detached from a note */
  [FieldNameMediaUpload.noteId]: number | null;

  /** The id of the {@link User} who uploaded the media file */
  [FieldNameMediaUpload.userId]: number;

  /** The name of the uploaded file */
  [FieldNameMediaUpload.fileName]: string;

  /** The backend where this upload is stored */
  [FieldNameMediaUpload.backendType]: BackendType;

  /** Additional data required by the backend storage to identify the uploaded file */
  [FieldNameMediaUpload.backendData]: string | null;

  /** Timestamp when the file was uploaded */
  [FieldNameMediaUpload.createdAt]: Date;
}

export enum FieldNameMediaUpload {
  uuid = 'uuid',
  noteId = 'note_id',
  userId = 'user_id',
  fileName = 'file_name',
  backendType = 'backend_type',
  backendData = 'backend_data',
  createdAt = 'created_at',
}

export const TableMediaUpload = 'media_upload';

export type TypeInsertMediaUpload = Omit<
  MediaUpload,
  FieldNameMediaUpload.createdAt | FieldNameMediaUpload.uuid
>;
export type TypeUpdateMediaUpload = Pick<
  MediaUpload,
  FieldNameMediaUpload.noteId
>;
