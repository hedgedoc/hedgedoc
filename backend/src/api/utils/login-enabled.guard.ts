/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, Inject, Injectable } from '@nestjs/common';

import authConfiguration, { AuthConfig } from '../../config/auth.config';
import { FeatureDisabledError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';

@Injectable()
export class LoginEnabledGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(LoginEnabledGuard.name);
  }

  canActivate(): boolean {
    if (!this.authConfig.local.enableLogin) {
      this.logger.debug('Local auth is disabled.', 'canActivate');
      throw new FeatureDisabledError('Local auth is disabled.');
    }
    return true;
  }
}
