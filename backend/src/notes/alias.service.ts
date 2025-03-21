/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasDto } from '@hedgedoc/commons';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Alias } from './alias.entity';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { getPrimaryAlias } from './utils';

@Injectable()
export class AliasService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    @InjectRepository(Alias) private aliasRepository: Repository<Alias>,
    @Inject(forwardRef(() => NotesService)) private notesService: NotesService,
  ) {
    this.logger.setContext(AliasService.name);
  }

  /**
   * @async
   * Add the specified alias to the note.
   * @param {Note} note - the note to add the alias to
   * @param {string} alias - the alias to add to the note
   * @throws {AlreadyInDBError} the alias is already in use.
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   * @return {Alias} the new alias
   */
  async addAlias(note: Note, alias: string): Promise<Alias> {
    await this.notesService.ensureNoteIdOrAliasIsAvailable(alias);

    let newAlias;
    if ((await note.aliases).length === 0) {
      // the first alias is automatically made the primary alias
      newAlias = Alias.create(alias, note, true);
    } else {
      newAlias = Alias.create(alias, note, false);
    }
    (await note.aliases).push(newAlias as Alias);

    await this.noteRepository.save(note);
    return newAlias as Alias;
  }

  /**
   * @async
   * Set the specified alias as the primary alias of the note.
   * @param {Note} note - the note to change the primary alias
   * @param {string} alias - the alias to be the new primary alias of the note
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   * @throws {NotInDBError} the alias is not part of this note.
   * @return {Alias} the new primary alias
   */
  async makeAliasPrimary(note: Note, alias: string): Promise<Alias> {
    let newPrimaryFound = false;
    let oldPrimaryId = 0;
    let newPrimaryId = 0;

    for (const anAlias of await note.aliases) {
      // found old primary
      if (anAlias.primary) {
        oldPrimaryId = anAlias.id;
      }

      // found new primary
      if (anAlias.name === alias) {
        newPrimaryFound = true;
        newPrimaryId = anAlias.id;
      }
    }

    if (!newPrimaryFound) {
      // the provided alias is not already an alias of this note
      this.logger.debug(
        `The alias '${alias}' is not used by this note.`,
        'makeAliasPrimary',
      );
      throw new NotInDBError(`The alias '${alias}' is not used by this note.`);
    }

    const oldPrimary = await this.aliasRepository.findOneByOrFail({
      id: oldPrimaryId,
    });
    const newPrimary = await this.aliasRepository.findOneByOrFail({
      id: newPrimaryId,
    });

    oldPrimary.primary = false;
    newPrimary.primary = true;

    await this.aliasRepository.save(oldPrimary);
    await this.aliasRepository.save(newPrimary);

    return newPrimary;
  }

  /**
   * @async
   * Remove the specified alias from the note.
   * @param {Note} note - the note to remove the alias from
   * @param {string} alias - the alias to remove from the note
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   * @throws {NotInDBError} the alias is not part of this note.
   * @throws {PrimaryAliasDeletionForbiddenError} the primary alias can only be deleted if it's the only alias
   */
  async removeAlias(note: Note, alias: string): Promise<Note> {
    const primaryAlias = await getPrimaryAlias(note);
    const noteAliases = await note.aliases;

    if (primaryAlias === alias && noteAliases.length !== 1) {
      this.logger.debug(
        `The alias '${alias}' is the primary alias, which can only be removed if it's the only alias.`,
        'removeAlias',
      );
      throw new PrimaryAliasDeletionForbiddenError(
        `The alias '${alias}' is the primary alias, which can only be removed if it's the only alias.`,
      );
    }

    const filteredAliases: Alias[] = [];
    let aliasToDelete: Alias | null = null;
    let aliasFound = false;

    for (const anAlias of noteAliases) {
      if (anAlias.name === alias) {
        aliasFound = true;
        aliasToDelete = anAlias;
      } else {
        filteredAliases.push(anAlias);
      }
    }

    if (!aliasFound) {
      this.logger.debug(
        `The alias '${alias}' is not used by this note or is the primary alias, which can't be removed.`,
        'removeAlias',
      );
      throw new NotInDBError(
        `The alias '${alias}' is not used by this note or is the primary alias, which can't be removed.`,
      );
    }

    if (aliasToDelete !== null) {
      await this.aliasRepository.remove(aliasToDelete);
    }

    note.aliases = Promise.resolve(filteredAliases);
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Build AliasDto from a note.
   * @param {Alias} alias - the alias to use
   * @param {Note} note - the note to use
   * @return {AliasDto} the built AliasDto
   * @throws {NotInDBError} the specified alias does not exist
   */
  toAliasDto(alias: Alias, note: Note): AliasDto {
    return {
      name: alias.name,
      primaryAlias: alias.primary,
      noteId: note.publicId,
    };
  }
}
