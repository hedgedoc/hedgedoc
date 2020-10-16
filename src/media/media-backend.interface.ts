import { BackendData } from './media-upload.entity';

export interface MediaBackend {
  /**
   * Saves a file according to backend internals.
   * @param buffer File data
   * @param fileName Name of the file to save. Can include a file extension.
   * @return Tuple of file URL and internal backend data, which should be saved.
   */
  saveFile(buffer: Buffer, fileName: string): Promise<[string, BackendData]>;

  /**
   * Retrieve the URL of a previously saved file.
   * @param fileName String to identify the file
   * @param backendData Internal backend data
   */
  getFileURL(fileName: string, backendData: BackendData): Promise<string>;

  /**
   * Delete a file from the backend
   * @param fileName String to identify the file
   * @param backendData Internal backend data
   */
  deleteFile(fileName: string, backendData: BackendData): Promise<void>;
}
