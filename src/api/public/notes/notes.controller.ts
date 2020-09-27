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
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NotePermissionsUpdateDto } from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';
import { MarkdownBody } from '../../utils/markdownbody-decorator';

@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
  ) {
  this.logger.setContext(NotesController.name);
  }

  @Post()
  async createNote(@MarkdownBody() text: string) {
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text);
  }

  @Get(':noteIdOrAlias')
  getNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    return this.noteService.getNoteDtoByIdOrAlias(noteIdOrAlias);
  }

  @Post(':noteAlias')
  async createNamedNote(
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ) {
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text, noteAlias);
  }

  @Delete(':noteIdOrAlias')
  async deleteNote(@Param('noteIdOrAlias') noteIdOrAlias: string) {
    this.logger.debug('Deleting note: ' + noteIdOrAlias);
    await this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
    this.logger.debug('Successfully deleted ' + noteIdOrAlias);
    return;
  }

  @Put(':noteIdOrAlias')
  async updateNote(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ) {
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, text);
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
    @Param('revisionId') revisionId: number,
  ) {
    return this.revisionsService.getNoteRevision(noteIdOrAlias, revisionId);
  }
}
