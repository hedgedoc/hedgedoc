import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as FileType from 'file-type';
import { Repository } from 'typeorm';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { BackendType } from './backends/backend-type.enum';
import { FilesystemBackend } from './backends/filesystem-backend';
import { MediaUpload } from './media-upload.entity';
import { MulterFile } from './multer-file.interface';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaUpload)
    private mediaUploadRepository: Repository<MediaUpload>,
    private notesService: NotesService,
    private usersService: UsersService,
  ) {}

  public async saveFile(file: MulterFile, username: string, noteId: string) {
    const note = await this.notesService.getNoteByIdOrAlias(noteId);
    const user = await this.usersService.getUserByUsername(username);
    const fileTypeResult = await FileType.fromBuffer(file.buffer);
    if (!fileTypeResult) {
      throw new Error('Could not detect file type.');
    }
    if (!MediaService.isAllowedMimeType(fileTypeResult.mime)) {
      throw new Error('MIME type not allowed');
    }
    //TODO: Choose backend according to config
    const mediaUpload = MediaUpload.create(
      note,
      user,
      fileTypeResult.ext,
      BackendType.FILEYSTEM,
    );
    const backend = new FilesystemBackend();
    const [url, backendData] = await backend.saveFile(
      file.buffer,
      mediaUpload.id,
    );
    mediaUpload.backendData = backendData;
    await this.mediaUploadRepository.save(mediaUpload);
    return url;
  }

  private static isAllowedMimeType(mimeType: string): boolean {
    //TODO: Which mimetypes are allowed?
    return true;
  }
}
