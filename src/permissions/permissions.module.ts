import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NoteUserPermission } from './note-user-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoteUserPermission, NoteGroupPermission]),
  ],
})
export class PermissionsModule {}
