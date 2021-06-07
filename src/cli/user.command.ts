/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import { UsersService } from '../users/users.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';

@Injectable()
export class UserCommand {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
  ) {}

  @Command({
    command: 'user:count',
    describe: 'counts all users',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  async count(): Promise<void> {
    console.log(`User count: ${await this.userService.countUsers()}`);
  }

  @Command({
    command: 'user:list',
    describe: 'lists all users',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  async list(): Promise<void> {
    const users = await this.userService.listUsers();
    for (const user of users) {
      console.log(user.userName + ' ' + user.displayName);
    }
  }

  @Command({
    command: 'user:create <username> <displayName>',
    describe: 'creates a user',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  async create(
    @Positional({
      name: 'username',
      describe: 'the username',
      type: 'string',
    })
    username: string,
    @Positional({
      name: 'displayName',
      describe: 'the display name',
      type: 'string',
    })
    displayName: string,
  ): Promise<void> {
    await this.userService.createUser(username, displayName);
  }

  @Command({
    command: 'user:changeDisplayName <username> <displayName>',
    describe: 'changes the users display name',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  async changeDisplayName(
    @Positional({
      name: 'username',
      describe: 'the username',
      type: 'string',
    })
    username: string,
    @Positional({
      name: 'displayName',
      describe: 'the display name',
      type: 'string',
    })
    displayName: string,
  ): Promise<void> {
    const user = await this.userService.getUserByUsername(username);
    await this.userService.changeDisplayName(user, displayName);
  }

  @Command({
    command: 'user:delete <username>',
    describe: 'creates a user',
    autoExit: true, // defaults to `true`, but you can use `false` if you need more control
  })
  async delete(
    @Positional({
      name: 'username',
      describe: 'the username',
      type: 'string',
    })
    username: string,
  ): Promise<void> {
    const user = await this.userService.getUserByUsername(username);
    await this.userService.deleteUser(user);
  }
}
