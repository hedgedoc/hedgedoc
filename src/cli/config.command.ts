/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Command } from 'nestjs-command';
import { Inject, Injectable } from '@nestjs/common';
import appConfiguration, { AppConfig } from '../config/app.config';
import authConfiguration, { AuthConfig } from '../config/auth.config';
import cspConfiguration, { CspConfig } from '../config/csp.config';
import databaseConfiguration, {
  DatabaseConfig,
} from '../config/database.config';
import hstsConfiguration, { HstsConfig } from '../config/hsts.config';
import mediaConfiguration, { MediaConfig } from '../config/media.config';

@Injectable()
export class ConfigCommand {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
    @Inject(authConfiguration.KEY)
    private readonly authConfig: AuthConfig,
    @Inject(cspConfiguration.KEY)
    private readonly cspConfig: CspConfig,
    @Inject(databaseConfiguration.KEY)
    private readonly databaseConfig: DatabaseConfig,
    @Inject(hstsConfiguration.KEY)
    private readonly hstsConfig: HstsConfig,
    @Inject(mediaConfiguration.KEY)
    private readonly mediaConfig: MediaConfig,
  ) {}

  @Command({
    command: 'config show',
    describe: 'show the current config',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  show(): void {
    console.log('AppConfig: ', this.appConfig);
    console.log('AuthConfig: ', this.authConfig);
    console.log('CspConfig: ', this.cspConfig);
    console.log('DatabaseConfig: ', this.databaseConfig);
    console.log('HstsConfig: ', this.hstsConfig);
    console.log('MediaConfig: ', this.mediaConfig);
  }
}
