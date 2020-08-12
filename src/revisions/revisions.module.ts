import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authorship } from './authorship.entity';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Revision, Authorship])],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
