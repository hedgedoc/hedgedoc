/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { CanActivate, Inject, Injectable } from '@nestjs/common';

import noteConfiguration, { NoteConfig } from '../../../config/note.config';
import { FeatureDisabledError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';

@Injectable()
export class GuestsEnabledGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
  ) {
    this.logger.setContext(GuestsEnabledGuard.name);
  }

  canActivate(): boolean {
    if (this.noteConfig.permissions.maxGuestLevel === PermissionLevel.DENY) {
      throw new FeatureDisabledError(
        'Guest usage is disabled',
        this.logger.getContext(),
        'canActivate',
      );
    }
    return true;
  }
}
