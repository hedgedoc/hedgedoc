import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NoteUserPermission } from './note-user-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoteUserPermission, NoteGroupPermission]),
    LoggerModule,
  ],
})
export class PermissionsModule {}
