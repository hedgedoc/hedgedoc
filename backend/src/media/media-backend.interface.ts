/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FileTypeResult } from 'file-type';

export interface MediaBackend {
  /**
   * Saves a file according to backend internals
   *
   * @param uuid Unique identifier of the uploaded file
   * @param buffer File data
   * @param fileType File type result
   * @returns The internal backend data, which should be saved
   * @throws MediaBackendError - there was an error saving the file
   */
  saveFile(
    uuid: string,
    buffer: Buffer,
    fileType?: FileTypeResult,
  ): Promise<string | null>;

  /**
   * Deletes a file from the backend
   *
   * @param uuid Unique identifier of the uploaded file
   * @param backendData Internal backend data
   * @throws MediaBackendError if there was an error deleting the file
   */
  deleteFile(uuid: string, backendData: string | null): Promise<void>;

  /**
   * Gets a publicly accessible URL of a file from the backend
   *
   * @param uuid Unique identifier of the uploaded file
   * @param backendData Internal backend data
   * @returns Public accessible URL of the file
   * @throws MediaBackendError if there was an error getting the file
   */
  getFileUrl(uuid: string, backendData: string | null): Promise<string>;
}
