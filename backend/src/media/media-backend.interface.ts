/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FileTypeResult } from 'file-type';

export interface MediaBackend {
  /**
   * Saves a file according to backend internals.
   * @param uuid Unique identifier of the uploaded file
   * @param buffer File data
   * @param fileType File type result
   * @throws {MediaBackendError} - there was an error saving the file
   * @return The internal backend data, which should be saved
   */
  saveFile(
    uuid: string,
    buffer: Buffer,
    fileType?: FileTypeResult,
  ): Promise<string | null>;

  /**
   * Delete a file from the backend
   * @param uuid Unique identifier of the uploaded file
   * @param backendData Internal backend data
   * @throws {MediaBackendError} - there was an error deleting the file
   */
  deleteFile(uuid: string, backendData: string | null): Promise<void>;

  /**
   * Get a publicly accessible URL of a file from the backend
   * @param uuid Unique identifier of the uploaded file
   * @param backendData Internal backend data
   * @throws {MediaBackendError} - there was an error getting the file
   * @return Public accessible URL of the file
   */
  getFileUrl(uuid: string, backendData: string | null): Promise<string>;
}
