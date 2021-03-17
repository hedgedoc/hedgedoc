/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module, OnModuleInit } from '@nestjs/common';
import { CommandModule, CommandService } from 'nestjs-command';
import { ConfigModule } from '@nestjs/config';
import { ConfigCommand } from './config.command';

@Module({
  imports: [CommandModule, ConfigModule],
  providers: [ConfigCommand],
})
export class CliModule implements OnModuleInit {
  constructor(private readonly command: CommandService) {}

  onModuleInit(): void {
    this.command.yargs.scriptName('admin-cli');
  }
}
