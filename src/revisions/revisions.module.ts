import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revision } from './revision.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Revision])],
})
export class RevisionsModule {}
