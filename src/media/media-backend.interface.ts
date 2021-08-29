/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BackendData } from './media-upload.entity';

export interface MediaBackend {
  /**
   * Saves a file according to backend internals.
   * @param buffer File data
   * @param fileName Name of the file to save. Can include a file extension.
   * @throws {MediaBackendError} - there was an error saving the file
   * @return Tuple of file URL and internal backend data, which should be saved.
   */
  saveFile(buffer: Buffer, fileName: string): Promise<[string, BackendData]>;

  /**
   * Delete a file from the backend
   * @param fileName String to identify the file
   * @param backendData Internal backend data
   * @throws {MediaBackendError} - there was an error deleting the file
   */
  deleteFile(fileName: string, backendData: BackendData): Promise<void>;
}
