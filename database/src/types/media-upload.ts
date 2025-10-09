/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum MediaBackendType {
  FILESYSTEM = 'filesystem',
  S3 = 's3',
  IMGUR = 'imgur',
  AZURE = 'azure',
  WEBDAV = 'webdav',
}

/**
 * A media upload object represents an uploaded file. While the file itself is stored in the configured storage backend,
 * the metadata is stored in the database. Uploads are attached to the {@link Note} where they were uploaded, but can be
 * detached by deleting the note and setting the option to keep the media files.
 */
export interface MediaUpload {
  /** UUID (v7) identifying the media upload. Is public and unique */
  [FieldNameMediaUpload.uuid]: string

  /** The id of the attached {@link Note} or null if the media upload was detached from a note */
  [FieldNameMediaUpload.noteId]: number | null

  /** The id of the {@link User} who uploaded the media file */
  [FieldNameMediaUpload.userId]: number

  /** The name of the uploaded file */
  [FieldNameMediaUpload.fileName]: string

  /** The backend where this upload is stored */
  [FieldNameMediaUpload.backendType]: MediaBackendType

  /** Additional data required by the backend storage to identify the uploaded file */
  [FieldNameMediaUpload.backendData]: string | null

  /** Timestamp when the file was uploaded */
  [FieldNameMediaUpload.createdAt]: string
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

export const TableMediaUpload = 'media_upload'

type TypeMediaUploadDate = Omit<MediaUpload, FieldNameMediaUpload.createdAt> & {
  [FieldNameMediaUpload.createdAt]: Date
}

export type TypeInsertMediaUpload = Omit<
  TypeMediaUploadDate,
  FieldNameMediaUpload.createdAt
>
export type TypeUpdateMediaUpload = Pick<
  TypeMediaUploadDate,
  FieldNameMediaUpload.noteId
>
