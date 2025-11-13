/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Alias, FieldNameAlias, TableAlias } from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import base32Encode from 'base32-encode';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { randomBytes } from 'node:crypto';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import { AliasDto } from '../dtos/alias.dto';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  GenericDBError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';

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
   * @returns The randomly generated alias
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
   * @throws AlreadyInDBError The alias is already in use.
   * @throws ForbiddenIdError The requested alias is forbidden
   */
  async addAlias(
    noteId: number,
    alias: string,
    transaction?: Knex,
  ): Promise<void> {
    const dbActor: Knex = transaction ? transaction : this.knex;
    const newAlias: Alias = {
      [FieldNameAlias.alias]: alias,
      [FieldNameAlias.noteId]: noteId,
      [FieldNameAlias.isPrimary]: false,
    };
    const oldAliases = await dbActor(TableAlias)
      .select(FieldNameAlias.alias)
      .where(FieldNameAlias.noteId, noteId);
    if (oldAliases.length === 0) {
      // The first alias is automatically made the primary aliases
      this.logger.debug(
        `There are no old aliases so the new one ${alias} will be primary`,
        'addAlias',
      );
      newAlias[FieldNameAlias.isPrimary] = true;
    }
    await dbActor(TableAlias).insert(newAlias);
  }

  /**
   * Makes the specified alias the primary alias of the note
   *
   * @param noteId The id of the note to change the primary alias
   * @param alias The alias to be the new primary alias of the note
   * @throws ForbiddenIdError when the requested alias is forbidden
   * @throws NotInDBError when the alias is not assigned to this note
   * @throws GenericDBError when the database has an inconsistent state
   */
  async makeAliasPrimary(noteId: number, alias: string): Promise<void> {
    await this.knex.transaction(async (transaction) => {
      // First, set all existing aliases to not primary
      const numberOfUpdatedEntries = await transaction(TableAlias)
        // This needs to be NULL in the database, as the constraints forbid multiple "false" values for the same note.
        // These are the same constraints that also ensure only one alias is primary ("true").
        .where(FieldNameAlias.noteId, noteId)
        .update(FieldNameAlias.isPrimary, null, [FieldNameAlias.alias]);
      if (numberOfUpdatedEntries.length === 0) {
        throw new GenericDBError(
          'The note does not exist or has no primary alias. This should never happen',
          this.logger.getContext(),
          'makeAliasPrimary',
        );
      }

      // Then set the specified alias to primary
      const numberOfUpdatedPrimaryAliases = await transaction(TableAlias)
        .update(FieldNameAlias.isPrimary, true)
        .where(FieldNameAlias.noteId, noteId)
        .andWhere(FieldNameAlias.alias, alias);

      if (numberOfUpdatedPrimaryAliases !== 1) {
        throw new NotInDBError(
          `The alias '${alias}' is not used by this note.`,
          this.logger.getContext(),
          'makeAliasPrimary',
        );
      }
    });
  }

  /**
   * Removes the specified alias from the note
   * This method only requires the alias since it can obtain the noteId from the alias prior to deletion
   *
   * @param alias The alias to remove from the note
   * @throws ForbiddenIdError The requested alias is forbidden
   * @throws NotInDBError The alias is not assigned to this note
   * @throws PrimaryAliasDeletionForbiddenError The primary alias cannot be deleted
   */
  async removeAlias(alias: string): Promise<void> {
    await this.knex.transaction(async (transaction) => {
      const aliases = await transaction(TableAlias)
        .select()
        .where(FieldNameAlias.alias, alias);
      if (aliases.length !== 1) {
        throw new NotInDBError(
          `The alias '${alias}' does not exist.`,
          this.logger.getContext(),
          'removeAlias',
        );
      }

      const noteId = aliases[0][FieldNameAlias.noteId];

      const numberOfDeletedAliases = await transaction(TableAlias)
        .where(FieldNameAlias.alias, alias)
        .andWhere(FieldNameAlias.noteId, noteId)
        .andWhere(FieldNameAlias.isPrimary, null)
        .delete();

      if (numberOfDeletedAliases !== 1) {
        this.logger.error(
          `While trying to remove alias ${alias} for note ${noteId}, removed ${numberOfDeletedAliases}`,
          'removeAlias',
        );
        throw new PrimaryAliasDeletionForbiddenError(
          `The alias '${alias}' is the primary alias, which can not be removed.`,
          this.logger.getContext(),
          'removeAlias',
        );
      }
    });
  }

  /**
   * Gets the primary alias of the note specified by the noteId
   *
   * @param noteId The id of the note to get the primary alias of
   * @param transaction The optional transaction to access the db
   * @returns The primary alias of the note
   * @throws NotInDBError The note has no primary alias which should mean that the note does not exist
   */
  async getPrimaryAliasByNoteId(
    noteId: number,
    transaction?: Knex,
  ): Promise<string> {
    const dbActor = transaction ?? this.knex;
    const primaryAlias = await dbActor(TableAlias)
      .select(FieldNameAlias.alias)
      .where(FieldNameAlias.noteId, noteId)
      .andWhere(FieldNameAlias.isPrimary, true)
      .first();
    if (primaryAlias === undefined) {
      throw new NotInDBError(
        'The note does not exist or has no primary alias. This should never happen',
        this.logger.getContext(),
        'getPrimaryAliasByNoteId',
      );
    }
    return primaryAlias[FieldNameAlias.alias];
  }

  /**
   * Gets all aliases of the note specified by the noteId
   *
   * @param noteId The id of the note to get the list of aliases for
   * @param transaction The optional transaction to access the db
   * @returns The list of aliases for the note
   * @throws NotInDBError The note with the specified id does not exist
   */
  async getAllAliases(
    noteId: number,
    transaction?: Knex,
  ): Promise<Pick<Alias, FieldNameAlias.alias | FieldNameAlias.isPrimary>[]> {
    const dbActor = transaction ?? this.knex;
    const aliases = await dbActor(TableAlias)
      .select(FieldNameAlias.alias, FieldNameAlias.isPrimary)
      .where(FieldNameAlias.noteId, noteId);
    if (aliases.length === 0) {
      throw new NotInDBError(
        'The note does not exist or has no aliases. This should never happen',
        this.logger.getContext(),
        'getAllAliases',
      );
    }
    return aliases;
  }

  /**
   * Checks if the provided alias is available for notes
   * This method does not return any value but throws an error if it is not successful
   *
   * @param alias The alias to check
   * @param transaction The optional transaction to access the db
   * @throws ForbiddenIdError The requested alias is not available
   * @throws AlreadyInDBError The requested alias already exists
   */
  async ensureAliasIsAvailable(
    alias: string,
    transaction?: Knex,
  ): Promise<void> {
    if (this.isAliasForbidden(alias)) {
      throw new ForbiddenIdError(
        `The alias '${alias}' is forbidden by the administrator.`,
        this.logger.getContext(),
        'ensureAliasIsAvailable',
      );
    }
    const isUsed = await this.isAliasUsed(alias, transaction);
    if (isUsed) {
      throw new AlreadyInDBError(
        `A note with the alias '${alias}' already exists.`,
        this.logger.getContext(),
        'ensureAliasIsAvailable',
      );
    }
  }

  /**
   * Checks if the provided alias is forbidden by configuration
   *
   * @param alias The alias to check
   * @returns true if the alias is forbidden, false otherwise
   */
  isAliasForbidden(alias: string): boolean {
    return this.noteConfig.forbiddenNoteIds.includes(alias);
  }

  /**
   * Checks if the provided alias is already used
   *
   * @param alias The alias to check
   * @param transaction The optional transaction to access the db
   * @returns true if the alias is already used, false otherwise
   */
  private async isAliasUsed(
    alias: string,
    transaction?: Knex,
  ): Promise<boolean> {
    const dbActor = transaction ? transaction : this.knex;
    const result = await dbActor(TableAlias)
      .select(FieldNameAlias.alias)
      .where(FieldNameAlias.alias, alias);
    if (result.length === 1) {
      this.logger.log(
        `A note with the alias '${alias}' already exists.`,
        'isAliasUsed',
      );
      return true;
    }
    return false;
  }

  /**
   * Returns alias information in the AliasDto format
   *
   * @param name The alias to use
   * @param isPrimaryAlias Whether the alias is the primary alias.
   * @returns The built AliasDto
   */
  toAliasDto(name: string, isPrimaryAlias: boolean): AliasDto {
    return AliasDto.create({
      name,
      isPrimaryAlias,
    });
  }
}
