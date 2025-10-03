/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import appConfiguration, { AppConfig } from '../config/app.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { isDevMode } from '../utils/dev-mode';
import { getServerVersionFromPackageJson } from '../utils/server-version';
import { PRIVATE_API_PATH, PUBLIC_API_PATH } from '../utils/swagger';

@Injectable()
class MessageService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
  ) {
    this.logger.setContext(MessageService.name);
  }

  async onApplicationBootstrap(): Promise<void> {
    const version = await getServerVersionFromPackageJson();
    const baseUrl = this.appConfig.baseUrl;
    const port = this.appConfig.backendPort;

    const publicApiDocsURL = new URL(PUBLIC_API_PATH, baseUrl).toString();
    const privateApiDocsURL = new URL(PRIVATE_API_PATH, baseUrl).toString();

    const logo = [
      '',
      '                @  @@@  @                  ',
      '            @@@@@@@@@@@@@@@@@              ',
      '         @@@@@@@@@@@@@@@@@@@@@@@           ',
      '        @@@@@@@@@@@@@@@@@@@@@@@@@          ',
      '      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@        ',
      '    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      ',
      '    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      ',
      '   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     ',
      '   @@@@@@@@      @@@@@@@      @@@@@@@@     ',
      '   @@@@@@           @           @@@@@@     ',
      '   @@@@@                         @@@@@     ',
      '   @@@@                           @@@@     ',
      '   @@@@@        @@     @@        @@@@@     ',
      '    @@@@        @@     @@        @@@@      ',
      '    @@@@@@                     @@@@@@      ',
      '      @@@@@@                 @@@@@@        ',
      '        @@@@@@             @@@@@@          ',
      '         @@@@@@@         @@@@@@@           ',
      '            @@@@@@     @@@@@@              ',
      '                @  @@@  @                  ',
      '',
    ];

    const defaultMessages = [
      `Welcome to HedgeDoc ${version.fullString}`,
      'You can find the documentation at https://docs.hedgedoc.org',
      `You can find the public API specification at ${publicApiDocsURL}`,
      `The backend is listening on port ${port}`,
    ];

    if (isDevMode()) {
      // Insert the private api url only if we're in DevMode
      defaultMessages.splice(
        3,
        0,
        `You can find the private API specification at ${privateApiDocsURL}`,
      );
    }

    // insert empty lines in between each line
    let insertIndex = 1;
    while (insertIndex <= defaultMessages.length) {
      defaultMessages.splice(insertIndex, 0, '');
      insertIndex++;
      insertIndex++;
    }

    const differenceOfLines = logo.length - defaultMessages.length;
    const numberOfLinesBefore = Math.ceil(differenceOfLines / 2);
    const numberOfLinesAfter = Math.floor(differenceOfLines / 2);

    const messages = [
      ...Array<string>(numberOfLinesBefore).fill(''),
      ...defaultMessages,
      ...Array<string>(numberOfLinesAfter).fill(''),
    ];

    for (let i = 0; i < logo.length; i++) {
      this.logger.log(`${logo[i]}${messages[i]}`);
    }
  }

  onApplicationShutdown(): void {
    this.logger.log('Goodbye. Thanks for using HedgeDoc! ❤️');
  }
}

export default MessageService;
