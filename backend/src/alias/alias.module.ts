/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { AliasService } from './alias.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AliasService],
  exports: [AliasService],
})
export class AliasModule {}
