import { Injectable, Logger } from '@nestjs/common';
import { HistoryEntryUpdateDto } from './history-entry-update.dto';
import { HistoryEntryDto } from './history-entry.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  getUserHistory(username: string): HistoryEntryDto[] {
    //TODO: Use the database
    this.logger.warn('Using hardcoded data!');
    return [
      {
        metadata: {
          alias: null,
          createTime: new Date(),
          description: 'Very descriptive text.',
          editedBy: [],
          id: 'foobar-barfoo',
          permission: {
            owner: {
              displayName: 'foo',
              userName: 'fooUser',
              email: 'foo@example.com',
              photo: '',
            },
            sharedTo: [],
          },
          tags: [],
          title: 'Title!',
          updateTime: new Date(),
          updateUser: {
            displayName: 'foo',
            userName: 'fooUser',
            email: 'foo@example.com',
            photo: '',
          },
          viewCount: 42,
        },
        pinStatus: false,
      },
    ];
  }

  updateHistoryEntry(
    noteId: string,
    updateDto: HistoryEntryUpdateDto,
  ): HistoryEntryDto {
    //TODO: Use the database
    this.logger.warn('Using hardcoded data!');
    return {
      metadata: {
        alias: null,
        createTime: new Date(),
        description: 'Very descriptive text.',
        editedBy: [],
        id: 'foobar-barfoo',
        permission: {
          owner: {
            displayName: 'foo',
            userName: 'fooUser',
            email: 'foo@example.com',
            photo: '',
          },
          sharedTo: [],
        },
        tags: [],
        title: 'Title!',
        updateTime: new Date(),
        updateUser: {
          displayName: 'foo',
          userName: 'fooUser',
          email: 'foo@example.com',
          photo: '',
        },
        viewCount: 42,
      },
      pinStatus: updateDto.pinStatus,
    };
  }

  deleteHistoryEntry(note: string) {
    //TODO: Use the database and actually do stuff
    throw new Error('Not implemented');
  }
}
