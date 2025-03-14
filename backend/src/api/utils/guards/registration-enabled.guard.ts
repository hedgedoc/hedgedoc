/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, Inject, Injectable } from '@nestjs/common';

import authConfiguration, { AuthConfig } from '../../../config/auth.config';
import { FeatureDisabledError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';

@Injectable()
export class RegistrationEnabledGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(RegistrationEnabledGuard.name);
  }

  canActivate(): boolean {
    if (!this.authConfig.local.enableRegister) {
      throw new FeatureDisabledError(
        'User registration is disabled',
        this.logger.getContext(),
        'canActivate',
      );
    }
    return true;
  }
}
