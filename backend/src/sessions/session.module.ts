/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { SessionService } from './session.service';

@Module({
  imports: [KnexModule],
  exports: [SessionService],
  providers: [SessionService],
})
export class SessionModule {}
