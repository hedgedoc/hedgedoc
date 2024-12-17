/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { GroupInfoDto } from '../../../groups/group-info.dto';
import { GroupsService } from '../../../groups/groups.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/openapi.decorator';

@UseGuards(SessionGuard)
@OpenApi(401, 403)
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private groupService: GroupsService,
  ) {
    this.logger.setContext(GroupsController.name);
  }

  @Get(':groupName')
  @OpenApi(200)
  async getGroup(@Param('groupName') groupName: string): Promise<GroupInfoDto> {
    return this.groupService.toGroupDto(
      await this.groupService.getGroupByName(groupName),
    );
  }
}
