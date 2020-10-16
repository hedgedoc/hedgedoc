import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaUpload]), NotesModule, UsersModule],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
