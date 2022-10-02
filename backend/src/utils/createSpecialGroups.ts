/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NestExpressApplication } from '@nestjs/platform-express';

import { AlreadyInDBError } from '../errors/errors';
import { GroupsService } from '../groups/groups.service';
import { SpecialGroup } from '../groups/groups.special';

export async function setupSpecialGroups(
  app: NestExpressApplication,
): Promise<void> {
  const groupService = app.get<GroupsService>(GroupsService);
  try {
    await groupService.createGroup(
      SpecialGroup.EVERYONE,
      SpecialGroup.EVERYONE,
      true,
    );
    await groupService.createGroup(
      SpecialGroup.LOGGED_IN,
      SpecialGroup.LOGGED_IN,
      true,
    );
  } catch (e) {
    if (e instanceof AlreadyInDBError) {
      // It's no problem if the special groups already exist
      return;
    }
    throw e;
  }
}
