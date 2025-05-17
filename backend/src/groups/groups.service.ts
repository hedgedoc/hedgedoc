/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GroupInfoDto } from '@hedgedoc/commons';
import {
  FieldNameGroup,
  TableGroup,
  TypeInsertGroup,
} from '@hedgedoc/database';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';

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
  async getGroupInfoDtoByName(name: string): Promise<GroupInfoDto> {
    const group = await this.knex(TableGroup)
      .select()
      .where(FieldNameGroup.name, name)
      .first();
    if (group === undefined) {
      throw new NotInDBError(`Group with name '${name}' not found`);
    }
    return {
      name: group[FieldNameGroup.name],
      displayName: group[FieldNameGroup.displayName],
      special: group[FieldNameGroup.isSpecial],
    };
  }

  /**
   * Fetches a groupId by its identifier name
   *
   * @param name Name of the group to query
   * @param transaction The optional database transaction to use
   * @return The groupId
   * @throws {NotInDBError} if there is no group with this name
   */
  async getGroupIdByName(name: string, transaction?: Knex): Promise<number> {
    const dbActor = transaction ?? this.knex;
    const group = await dbActor(TableGroup)
      .select(FieldNameGroup.id)
      .where(FieldNameGroup.name, name)
      .first();
    if (group === undefined) {
      throw new NotInDBError(`Group with name '${name}' not found`);
    }
    return group[FieldNameGroup.id];
  }
}
