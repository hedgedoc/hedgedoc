import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';
import { promises as fs } from 'fs';
import { join } from 'path';

export class FilesystemBackend implements MediaBackend {
  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    // TODO: Get uploads directory from config
    const uploadDirectory = './uploads';
    // TODO: Add server address to url
    const filePath = join(uploadDirectory, fileName);
    await fs.writeFile(filePath, buffer, null);
    return ['/' + filePath, null];
  }

  deleteFile(fileName: string, backendData: BackendData): Promise<void> {
    return Promise.resolve(undefined);
  }

  getFileURL(fileNam: string, backendData: BackendData): Promise<string> {
    return Promise.resolve('');
  }
}
