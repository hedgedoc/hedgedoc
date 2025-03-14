/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { NoteModule } from '../notes/note.module';
import { PermissionService } from './permission.service';

@Module({
  imports: [KnexModule, LoggerModule, forwardRef(() => NoteModule)],
  exports: [PermissionService],
  providers: [PermissionService],
})
export class PermissionsModule {}
