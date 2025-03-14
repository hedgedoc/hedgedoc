/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { FieldNameGroup, Group, TableGroup } from '../database/types';
import { TypeInsertGroup } from '../database/types/group';
import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { GroupInfoDto } from './group-info.dto';
import { SpecialGroup } from './groups.special';

@Injectable()
export class GroupsService {
  constructor(
    private readonly logger: ConsoleLoggerService,

    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(GroupsService.name);
  }

  /**
   * Create a new group with a given name and displayName
   *
   * @param name The group name as identifier the new group shall have
   * @param displayName The display name the new group shall have
   * @throws {AlreadyInDBError} The group name is already taken
   */
  async createGroup(name: string, displayName: string): Promise<void> {
    const group: TypeInsertGroup = {
      [FieldNameGroup.name]: name,
      [FieldNameGroup.displayName]: displayName,
      [FieldNameGroup.isSpecial]: false,
    };
    try {
      await this.knex(TableGroup).insert(group);
    } catch {
      const message = `A group with the name '${name}' already exists.`;
      this.logger.debug(message, 'createGroup');
      throw new AlreadyInDBError(message);
    }
  }

  /**
   * Fetches a group by its identifier name
   *
   * @param name Name of the group to query
   * @return The group
   * @throws {NotInDBError} if there is no group with this name
   */
  async getGroupByName(name: string): Promise<Group> {
    const group = await this.knex(TableGroup)
      .select()
      .where(FieldNameGroup.name, name)
      .first();
    if (group === undefined) {
      throw new NotInDBError(`Group with name '${name}' not found`);
    }
    return group;
  }

  /**
   * Fetches the group object for the EVERYONE special group
   *
   * @return The EVERYONE group
   */
  getEveryoneGroup(): Promise<Group> {
    return this.getGroupByName(SpecialGroup.EVERYONE);
  }

  /**
   * Fetches the group object for the LOGGED_IN special group
   *
   * @return the LOGGED_IN group
   */
  getLoggedInGroup(): Promise<Group> {
    return this.getGroupByName(SpecialGroup.LOGGED_IN);
  }

  /**
   * Builds the GroupInfoDto from a {@link Group}
   *
   * @param group the group to use
   * @return The built GroupInfoDto
   */
  toGroupDto(group: Group): GroupInfoDto {
    return {
      name: group.name,
      displayName: group[FieldNameGroup.displayName],
      isSpecial: group[FieldNameGroup.isSpecial],
    };
  }
}
