import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { MediaBackend } from '../media-backend.interface';
import { BackendData } from '../media-upload.entity';

@Injectable()
export class FilesystemBackend implements MediaBackend {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(FilesystemBackend.name);
  }

  async saveFile(
    buffer: Buffer,
    fileName: string,
  ): Promise<[string, BackendData]> {
    const filePath = FilesystemBackend.getFilePath(fileName);
    this.logger.debug(`Writing file to: ${filePath}`, 'saveFile');
    await fs.writeFile(filePath, buffer, null);
    return ['/' + filePath, null];
  }

  async deleteFile(fileName: string, backendData: BackendData): Promise<void> {
    return fs.unlink(FilesystemBackend.getFilePath(fileName));
  }

  getFileURL(fileName: string, backendData: BackendData): Promise<string> {
    const filePath = FilesystemBackend.getFilePath(fileName);
    // TODO: Add server address to url
    return Promise.resolve('/' + filePath);
  }

  private static getFilePath(fileName: string): string {
    // TODO: Get uploads directory from config
    const uploadDirectory = './uploads';
    return join(uploadDirectory, fileName);
  }
}
