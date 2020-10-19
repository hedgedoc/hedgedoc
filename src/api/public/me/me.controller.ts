import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { HistoryEntryUpdateDto } from '../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { NotesService } from '../../../notes/notes.service';
import { UserInfoDto } from '../../../users/user-info.dto';
import { UsersService } from '../../../users/users.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private historyService: HistoryService,
    private notesService: NotesService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @Get()
  async getMe(): Promise<UserInfoDto> {
    return this.usersService.toUserDto(
      await this.usersService.getUserByUsername('hardcoded'),
    );
  }

  @Get('history')
  getUserHistory(): HistoryEntryDto[] {
    return this.historyService.getUserHistory('someone');
  }

  @Put('history/:note')
  updateHistoryEntry(
    @Param('note') note: string,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): HistoryEntryDto {
    return this.historyService.updateHistoryEntry(note, entryUpdateDto);
  }

  @Delete('history/:note')
  @HttpCode(204)
  deleteHistoryEntry(@Param('note') note: string) {
    try {
      return this.historyService.deleteHistoryEntry(note);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('notes')
  getMyNotes(): NoteMetadataDto[] {
    return this.notesService.getUserNotes('someone');
  }
}
