/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import base32Encode from 'base32-encode';
import { randomBytes } from 'crypto';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  Alias,
  FieldNameAlias,
  FieldNameNote,
  Note,
  TableAlias,
} from '../database/types';
import { TypeInsertAlias } from '../database/types/alias';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  GenericDBError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { AliasDto } from './alias.dto';

@Injectable()
export class AliasService {
  constructor(
    private readonly logger: ConsoleLoggerService,

    @InjectConnection()
    private readonly knex: Knex,

    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
  ) {
    this.logger.setContext(AliasService.name);
  }

  /**
   * Generates a random alias for a note.
   * This is a randomly generated 128-bit value encoded with base32-encode using the crockford variant
   * and converted to lowercase.
   *
   * @return The randomly generated alias
   */
  generateRandomAlias(): string {
    const randomId = randomBytes(16);
    return base32Encode(randomId, 'Crockford').toLowerCase();
  }

  /**
   * Adds the specified alias to the note
   *
   * @param noteId The id of the note to add the aliases to
   * @param alias The alias to add to the note
   * @param transaction The optional transaction to access the db
   * @throws {AlreadyInDBError} The alias is already in use.
   * @throws {ForbiddenIdError} The requested alias is forbidden
   */
  async addAlias(
    noteId: Note[FieldNameNote.id],
    alias: Alias[FieldNameAlias.alias],
    transaction?: Knex,
  ): Promise<void> {
    const dbActor = transaction ? transaction : this.knex;
    const newAlias: TypeInsertAlias = {
      [FieldNameAlias.alias]: alias,
      [FieldNameAlias.noteId]: noteId,
      [FieldNameAlias.isPrimary]: false,
    };
    const oldAliases = await dbActor(TableAlias)
      .select(FieldNameAlias.alias)
      .where(FieldNameAlias.noteId, noteId);
    if (oldAliases.length === 0) {
      // The first alias is automatically made the primary aliases
      newAlias[FieldNameAlias.isPrimary] = true;
    }
    await dbActor(TableAlias).insert(newAlias);
  }

  /**
   * Makes the specified alias the primary alias of the note
   *
   * @param noteId The id of the note to change the primary alias
   * @param alias The alias to be the new primary alias of the note
   * @throws {ForbiddenIdError} The requested alias is forbidden
   * @throws {NotInDBError} The alias is not assigned to this note
   */
  async makeAliasPrimary(
    noteId: Note[FieldNameNote.id],
    alias: Alias[FieldNameAlias.alias],
  ): Promise<void> {
    await this.knex.transaction(async (transaction) => {
      // First set all existing aliases to not primary
      const numberOfUpdatedEntries = await transaction(TableAlias)
        .update(FieldNameAlias.isPrimary, null)
        .where(FieldNameAlias.noteId, noteId);
      if (numberOfUpdatedEntries === 0) {
        const message = `The note does not exists or has no primary alias. This should never happen`;
        this.logger.error(message, 'makeAliasPrimary');
        throw new GenericDBError(message);
      }

      // Then set the specified alias to primary
      const numberOfUpdatedPrimaryAliases = await transaction(TableAlias)
        .update(FieldNameAlias.isPrimary, true)
        .where(FieldNameAlias.noteId, noteId)
        .andWhere(FieldNameAlias.alias, alias);

      if (numberOfUpdatedPrimaryAliases !== 1) {
        const message = `The alias '${alias}' is not used by this note.`;
        this.logger.error(message, 'makeAliasPrimary');
        throw new NotInDBError(message);
      }
    });
  }

  /**
   * Removes the specified alias from the note
   * This method only does not require the noteId since it can be obtained from the alias prior to deletion
   *
   * @param alias The alias to remove from the note
   * @throws {ForbiddenIdError} The requested alias is forbidden
   * @throws {NotInDBError} The alias is not assigned to this note
   * @throws {PrimaryAliasDeletionForbiddenError} The primary alias cannot be deleted
   */
  async removeAlias(alias: Alias[FieldNameAlias.alias]): Promise<void> {
    await this.knex.transaction(async (transaction) => {
      const aliases = await transaction(TableAlias)
        .select()
        .where(FieldNameAlias.alias, alias);
      if (aliases.length !== 1) {
        const message = `The alias '${alias}' does not exist.`;
        this.logger.debug(message, 'removeAlias');
        throw new NotInDBError(message);
      }

      const noteId = aliases[0][FieldNameAlias.noteId];

      const numberOfDeletedAliases = await transaction(TableAlias)
        .where(FieldNameAlias.alias, alias)
        .andWhere(FieldNameAlias.noteId, noteId)
        .andWhere(FieldNameAlias.isPrimary, null)
        .delete();

      if (numberOfDeletedAliases !== 0) {
        const message = `The alias '${alias}' is the primary alias, which can not be removed.`;
        this.logger.debug(message, 'removeAlias');
        throw new PrimaryAliasDeletionForbiddenError(message);
      }
    });
  }

  /**
   * Checks if the provided alias is available for notes
   * This method does not return any value but throws an error if it is not successful
   *
   * @param alias The alias to check
   * @param transaction The optional transaction to access the db
   * @throws {ForbiddenIdError} The requested alias is not available
   * @throws {AlreadyInDBError} The requested alias already exists
   */
  async ensureAliasIsAvailable(
    alias: Alias[FieldNameAlias.alias],
    transaction?: Knex,
  ): Promise<void> {
    if (this.isAliasForbidden(alias)) {
      throw new ForbiddenIdError(
        `The alias '${alias}' is forbidden by the administrator.`,
      );
    }
    const isUsed = await this.isAliasUsed(alias, transaction);
    if (isUsed) {
      throw new AlreadyInDBError(
        `A note with the id or alias '${alias}' already exists.`,
      );
    }
  }

  /**
   * Checks if the provided alias is forbidden by configuration
   *
   * @param alias The alias to check
   * @return {boolean} true if the alias is forbidden, false otherwise
   */
  isAliasForbidden(alias: Alias[FieldNameAlias.alias]): boolean {
    const forbidden = this.noteConfig.forbiddenNoteIds.includes(alias);
    if (forbidden) {
      this.logger.warn(
        `A note with the alias '${alias}' is forbidden by the administrator.`,
        'isAliasForbidden',
      );
    }
    return forbidden;
  }

  /**
   * Checks if the provided alias is already used
   *
   * @param alias The alias to check
   * @param transaction The optional transaction to access the db
   * @return {boolean} true if the id or alias is already used, false otherwise
   */
  async isAliasUsed(
    alias: Alias[FieldNameAlias.alias],
    transaction?: Knex,
  ): Promise<boolean> {
    const dbActor = transaction ? transaction : this.knex;
    const result = await dbActor(TableAlias)
      .select(FieldNameAlias.alias)
      .where(FieldNameAlias.alias, alias);
    if (result.length === 1) {
      this.logger.warn(
        `A note with the id or alias '${alias}' already exists.`,
        'isAliasUsed',
      );
      return true;
    }
    return false;
  }

  /**
   * Build the AliasDto from a note.
   * @param alias The alias to use
   * @throws {NotInDBError} The specified alias does not exist
   * @return {AliasDto} The built AliasDto
   */
  toAliasDto(alias: Alias): AliasDto {
    return {
      name: alias[FieldNameAlias.alias],
      isPrimary: alias[FieldNameAlias.isPrimary],
    };
  }
}
