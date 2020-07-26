import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  controllers: [],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
