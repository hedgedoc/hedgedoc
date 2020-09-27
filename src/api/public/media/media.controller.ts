import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';

@Controller('media')
export class MediaController {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(MediaController.name);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file) {
    this.logger.debug('Recieved file: ' + file);
  }
}
