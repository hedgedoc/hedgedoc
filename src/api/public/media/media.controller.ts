import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientError, NotInDBError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { NotesService } from '../../../notes/notes.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
    private notesService: NotesService,
  ) {
    this.logger.setContext(MediaController.name);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Headers('HedgeDoc-Note') noteId: string,
  ) {
    //TODO: Get user from request
    const username = 'hardcoded';
    this.logger.debug(
      `Recieved filename '${file.originalname}' for note '${noteId}' from user '${username}'`,
      'uploadImage',
    );
    try {
      const url = await this.mediaService.saveFile(file, username, noteId);
      return {
        link: url,
      };
    } catch (e) {
      if (e instanceof ClientError || e instanceof NotInDBError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }
}
