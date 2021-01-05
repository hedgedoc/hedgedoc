/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HistoryEntryUpdateDto } from './history-entry-update.dto';
import { HistoryEntryDto } from './history-entry.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(HistoryService.name);
  }

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
          permissions: {
            owner: {
              displayName: 'foo',
              userName: 'fooUser',
              email: 'foo@example.com',
              photo: '',
            },
            sharedToUsers: [],
            sharedToGroups: [],
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
        permissions: {
          owner: {
            displayName: 'foo',
            userName: 'fooUser',
            email: 'foo@example.com',
            photo: '',
          },
          sharedToUsers: [],
          sharedToGroups: [],
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
