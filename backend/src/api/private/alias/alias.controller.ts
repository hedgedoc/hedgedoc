/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasCreateDto } from '@hedgedoc/commons';
import { AliasUpdateDto } from '@hedgedoc/commons';
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
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { OpenApi } from '../../utils/openapi.decorator';

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

  @Post()
  @OpenApi(201, 400, 404, 409)
  async addAlias(
    @RequestUserId() userId: number,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<void> {
    const noteId = await this.noteService.getNoteIdByAlias(
      newAliasDto.noteAlias,
    );
    const isUserNoteOwner = await this.permissionsService.isOwner(
      userId,
      noteId,
    );
    if (!isUserNoteOwner) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.ensureAliasIsAvailable(newAliasDto.newAlias);
    await this.aliasService.addAlias(noteId, newAliasDto.newAlias);
  }

  @Put(':aliases')
  @OpenApi(200, 400, 404)
  async makeAliasPrimary(
    @RequestUserId() userId: number,
    @Param('alias') alias: string,
    @Body() changeAliasDto: AliasUpdateDto,
  ): Promise<void> {
    if (!changeAliasDto.primaryAlias) {
      throw new BadRequestException(
        `The field 'primaryAlias' must be set to 'true'.`,
      );
    }
    const noteId = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(userId, noteId))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.makeAliasPrimary(noteId, alias);
  }

  @Delete(':aliases')
  @OpenApi(204, 400, 404)
  async removeAlias(
    @RequestUserId() userId: number,
    @Param('alias') alias: string,
  ): Promise<void> {
    const note = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(userId, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(alias);
    return;
  }
}
