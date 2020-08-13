import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorColor } from './author-color.entity';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Note, AuthorColor])],
  controllers: [],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
