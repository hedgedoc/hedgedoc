import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { NotePermissionsUpdateDto } from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';

@Controller('notes')
export class NotesController {
  constructor(
    private noteService: NotesService,
    private revisionsService: RevisionsService,
  ) {}

  @Post()
  createNote(@Body() noteContent: string) {
    return this.noteService.createNote(noteContent);
  }

  @Get(':noteIdOrAlias')
  getNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
  }

  @Post(':noteAlias')
  createNamedNote(
    @Param('noteAlias') noteAlias: string,
    @Body() noteContent: string,
  ) {
    return this.noteService.createNote(noteContent, noteAlias);
  }

  @Delete(':noteIdOrAlias')
  deleteNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
  }

  @Put(':noteIdOrAlias')
  updateNote(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() noteContent: string,
  ) {
    return this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, noteContent);
  }

  @Get(':noteIdOrAlias/content')
  @Header('content-type', 'text/markdown')
  getNoteContent(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteContent(noteIdOrAlias);
  }

  @Get(':noteIdOrAlias/metadata')
  getNoteMetadata(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteMetadata(noteIdOrAlias);
  }

  @Put(':noteIdOrAlias/permissions')
  updateNotePermissions(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ) {
    return this.noteService.updateNotePermissions(noteIdOrAlias, updateDto);
  }

  @Get(':noteIdOrAlias/revisions')
  getNoteRevisions(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.revisionsService.getNoteRevisionMetadatas(noteIdOrAlias);
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  getNoteRevision(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: string,
  ) {
    return this.revisionsService.getNoteRevision(noteIdOrAlias, revisionId);
  }
}
