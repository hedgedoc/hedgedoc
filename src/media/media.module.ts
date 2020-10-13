import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaUpload } from './media-upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaUpload])],
})
export class MediaModule {}
