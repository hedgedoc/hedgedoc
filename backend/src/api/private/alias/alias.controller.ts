/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateDto, AliasUpdateDto } from '@hedgedoc/commons';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AliasService } from '../../../alias/alias.service';
import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('alias')
@Controller('alias')
export class AliasController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private aliasService: AliasService,
    private noteService: NoteService,
    private permissionsService: PermissionService,
  ) {
    this.logger.setContext(AliasController.name);
  }

  /**
   * Checks if the user has permission to modify the note with the given alias and returns the note ID.
   *
   * @param userId The ID of the user
   * @param existingAlias The alias of the note
   * @returns The ID of the note
   * @throws UnauthorizedException if the user does not have permission to modify the note
   */
  private async getNoteIdWithPermissionCheck(
    userId: number,
    existingAlias: string,
  ): Promise<number> {
    const noteId = await this.noteService.getNoteIdByAlias(existingAlias);
    const isUserNoteOwner = await this.permissionsService.isOwner(
      userId,
      noteId,
    );
    if (!isUserNoteOwner) {
      throw new UnauthorizedException(
        'Modifying aliases requires note ownership permissions',
      );
    }
    return noteId;
  }

  @Post()
  @OpenApi(201, 400, 404, 409)
  async addAlias(
    @RequestUserId() userId: number,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<void> {
    const noteId = await this.getNoteIdWithPermissionCheck(
      userId,
      newAliasDto.noteAlias,
    );
    await this.aliasService.ensureAliasIsAvailable(newAliasDto.newAlias);
    await this.aliasService.addAlias(noteId, newAliasDto.newAlias);
  }

  @Put(':alias')
  @OpenApi(200, 400, 404)
  async makeAliasPrimary(
    @RequestUserId() userId: number,
    @Param('alias') alias: string,
    @Body() changeAliasDto: AliasUpdateDto,
  ): Promise<void> {
    if (!changeAliasDto.primaryAlias) {
      throw new BadRequestException(
        `This endpoint can only set an alias as primary, therefore the field 'primaryAlias' must be set to 'true'.`,
      );
    }
    const noteId = await this.getNoteIdWithPermissionCheck(userId, alias);
    await this.aliasService.makeAliasPrimary(noteId, alias);
  }

  @Delete(':alias')
  @OpenApi(204, 400, 404)
  async removeAlias(
    @RequestUserId() userId: number,
    @Param('alias') alias: string,
  ): Promise<void> {
    await this.getNoteIdWithPermissionCheck(userId, alias);
    await this.aliasService.removeAlias(alias);
  }
}
