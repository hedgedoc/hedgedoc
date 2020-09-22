import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { AuthorColor } from './author-color.entity';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, AuthorColor]),
    forwardRef(() => RevisionsModule),
    UsersModule,
  ],
  controllers: [],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
