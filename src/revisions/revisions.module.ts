import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Revision])],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
