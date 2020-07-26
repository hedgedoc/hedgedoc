import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file) {
    this.logger.debug('Recieved file: ' + file);
  }
}
