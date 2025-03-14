/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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

import { AliasCreateDto } from '../../../alias/alias-create.dto';
import { AliasUpdateDto } from '../../../alias/alias-update.dto';
import { AliasDto } from '../../../alias/alias.dto';
import { AliasService } from '../../../alias/alias.service';
import { SessionGuard } from '../../../auth/session.guard';
import { FieldNameUser, User } from '../../../database/types';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

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
    @RequestUser() userId: User[FieldNameUser.id],
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    const isUserNoteOwner = await this.permissionsService.isOwner(
      userId,
      newAliasDto.noteId,
    );
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.ensureAliasIsAvailable(alias);
    const updatedAlias = await this.aliasesService.addAlias(
      note,
      newAliasDto.newAlias,
    );
    return this.aliasesService.toAliasDto(updatedAlias, note);
  }

  @Put(':aliases')
  @OpenApi(200, 400, 404)
  async makeAliasPrimary(
    @RequestUser() user: User,
    @Param('alias') alias: string,
    @Body() changeAliasDto: AliasUpdateDto,
  ): Promise<AliasDto> {
    if (!changeAliasDto.primaryAlias) {
      throw new BadRequestException(
        `The field 'primaryAlias' must be set to 'true'.`,
      );
    }
    const note = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const updatedAlias = await this.aliasService.makeAliasPrimary(note, alias);
    return this.aliasService.toAliasDto(updatedAlias, note);
  }

  @Delete(':aliases')
  @OpenApi(204, 400, 404)
  async removeAlias(
    @RequestUser() user: User,
    @Param('alias') alias: string,
  ): Promise<void> {
    const note = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(note, alias);
    return;
  }
}
