/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { PermissionsService } from './permissions.service';

@Module({
  exports: [PermissionsService],
  providers: [PermissionsService],
})
export class PermissionsModule {}
