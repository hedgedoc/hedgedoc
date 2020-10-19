import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';
import { FilesystemBackend } from './backends/filesystem-backend';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaUpload]),
    NotesModule,
    UsersModule,
    LoggerModule,
  ],
  providers: [MediaService, FilesystemBackend],
  exports: [MediaService],
})
export class MediaModule {}
