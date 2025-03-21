/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GroupInfoDto } from '@hedgedoc/commons';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Group } from './group.entity';
import { SpecialGroup } from './groups.special';

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
   * Create a new group with a given name and displayName
   * @param name - the group name the new group shall have
   * @param displayName - the display name the new group shall have
   * @param special - if the group is special or not
   * @return {Group} the group
   * @throws {AlreadyInDBError} the group name is already taken.
   */
  async createGroup(
    name: string,
    displayName: string,
    special = false,
  ): Promise<Group> {
    const group = Group.create(name, displayName, special);
    try {
      return await this.groupRepository.save(group);
    } catch {
      this.logger.debug(
        `A group with the name '${name}' already exists.`,
        'createGroup',
      );
      throw new AlreadyInDBError(
        `A group with the name '${name}' already exists.`,
      );
    }
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
    if (group === null) {
      throw new NotInDBError(`Group with name '${name}' not found`);
    }
    return group;
  }

  /**
   * Get the group object for the everyone special group.
   * @return {Group} the EVERYONE group
   */
  getEveryoneGroup(): Promise<Group> {
    return this.getGroupByName(SpecialGroup.EVERYONE);
  }

  /**
   * Get the group object for the logged-in special group.
   * @return {Group} the LOGGED_IN group
   */
  getLoggedInGroup(): Promise<Group> {
    return this.getGroupByName(SpecialGroup.LOGGED_IN);
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
