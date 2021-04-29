/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { NotInDBError } from '../errors/errors';
import { GroupInfoDto } from './group-info.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
  ) {
    this.logger.setContext(GroupsService.name);
  }

  /**
   * @async
   * Get a group by their name.
   * @param {string} name - the groups name
   * @return {Group} the group
   * @throws {NotInDBError} there is no group with this name
   */
  async getGroupByName(name: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { name: name },
    });
    if (group === undefined) {
      throw new NotInDBError(`Group with name '${name}' not found`);
    }
    return group;
  }

  /**
   * Build GroupInfoDto from a group.
   * @param {Group} group - the group to use
   * @return {GroupInfoDto} the built GroupInfoDto
   */
  toGroupDto(group: Group): GroupInfoDto {
    return {
      name: group.name,
      displayName: group.displayName,
      special: group.special,
    };
  }
}
