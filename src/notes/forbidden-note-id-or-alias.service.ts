/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import { ForbiddenIdError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';

@Injectable()
export class ForbiddenNoteIdOrAliasService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
  ) {}

  /**
   * Check if the provided note id or alias is forbidden
   *
   * @param noteIdOrAlias - the alias or id in question
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   */
  isForbiddenNoteIdOrAlias(noteIdOrAlias: string): void {
    if (this.noteConfig.forbiddenNoteIds.includes(noteIdOrAlias)) {
      this.logger.debug(
        `A note with the alias '${noteIdOrAlias}' is forbidden by the administrator.`,
        'isForbiddenNoteIdOrAlias',
      );
      throw new ForbiddenIdError(
        `A note with the alias '${noteIdOrAlias}' is forbidden by the administrator.`,
      );
    }
  }
}
