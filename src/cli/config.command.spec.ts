/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test } from '@nestjs/testing';
import { CommandModule, CommandModuleTest } from 'nestjs-command';
import { ConfigCommand } from './config.command';
import { ConfigModule } from '@nestjs/config';
import mediaConfigMock from '../config/media.config.mock';
import appConfigMock from '../config/app.config.mock';
import authConfig from '../config/auth.config';
import cspConfig from '../config/csp.config';
import databaseConfig from '../config/database.config';
import hstsConfig from '../config/hsts.config';

describe('ConfigCommand', () => {
  let commandModule: CommandModuleTest;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        CommandModule,
        ConfigCommand,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            mediaConfigMock,
            appConfigMock,
            authConfig,
            cspConfig,
            databaseConfig,
            hstsConfig,
          ],
        }),
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    commandModule = new CommandModuleTest(app.select(CommandModule));
  });

  it('config show works', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const command = 'config show';
    const args = {};
    const exitCode = 0;

    await commandModule.execute(command, args, exitCode);
    expect(consoleSpy).toHaveBeenCalledWith('AppConfig: ', appConfigMock());
    expect(consoleSpy).toHaveBeenCalledWith('AuthConfig: ', authConfig());
    expect(consoleSpy).toHaveBeenCalledWith('CspConfig: ', cspConfig());
    expect(consoleSpy).toHaveBeenCalledWith(
      'DatabaseConfig: ',
      databaseConfig(),
    );
    expect(consoleSpy).toHaveBeenCalledWith('HstsConfig: ', hstsConfig());
    expect(consoleSpy).toHaveBeenCalledWith('MediaConfig: ', mediaConfigMock());
  });
});
