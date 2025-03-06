/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BackendType } from '../media/backends/backend-type.enum';

/**
 * A media upload object represents an uploaded file. While the file itself is stored in the configured storage backend,
 * the metadata is stored in the database. Uploads are attached to the {@link Note} where they were uploaded, but can be
 * detached by deleting the note and setting the option to keep the media files.
 */
export interface MediaUpload {
  /** UUID (v7) identifying the media upload. Is public and unique */
  uuid: string;

  /** The id of the attached {@link Note} or null if the media upload was detached from a note */
  noteId: number | null;

  /** The id of the {@link User} who uploaded the media file */
  userId: number;

  /** The name of the uploaded file */
  fileName: string;

  /** The backend where this upload is stored */
  backendType: BackendType;

  /** Additional data required by the backend storage to identify the uploaded file */
  backendData: string | null;

  /** Timestamp when the file was uploaded */
  createdAt: Date;
}
