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
 * the metadata is stored in the database. Uploads can be linked to zero or more notes.
 */
export interface MediaUpload {
  /** UUID (v7) identifying the media upload. Is public and unique */
  [FieldNameMediaUpload.uuid]: string

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
  userId = 'user_id',
  fileName = 'file_name',
  backendType = 'backend_type',
  backendData = 'backend_data',
  createdAt = 'created_at',
}

export const TableMediaUpload = 'media_upload'

export const TableMediaUploadNote = 'media_upload_note'

export enum FieldNameMediaUploadNote {
  mediaUploadUuid = 'media_upload_uuid',
  noteId = 'note_id',
}

export type TypeUpdateMediaUpload = never

export interface MediaUploadNote {
  [FieldNameMediaUploadNote.mediaUploadUuid]: string
  [FieldNameMediaUploadNote.noteId]: number
}
