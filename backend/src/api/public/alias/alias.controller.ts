/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasSchema } from '@hedgedoc/commons';
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
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AliasService } from '../../../alias/alias.service';
import { AliasCreateDto } from '../../../dtos/alias-create.dto';
import { AliasUpdateDto } from '../../../dtos/alias-update.dto';
import { AliasDto } from '../../../dtos/alias.dto';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { ApiTokenGuard } from '../../utils/guards/api-token.guard';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('alias')
@ApiSecurity('token')
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
  @OpenApi(
    {
      code: 200,
      description: 'The new alias',
      schema: AliasSchema,
    },
    403,
    404,
  )
  async addAlias(
    @RequestUserId() userId: number,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    const noteId = await this.noteService.getNoteIdByAlias(
      newAliasDto.noteAlias,
    );
    const isUserOwner = await this.permissionsService.isOwner(userId, noteId);
    if (!isUserOwner) {
      throw new UnauthorizedException(
        'Only the owner of a note can modify its aliases',
      );
    }
    await this.aliasService.addAlias(noteId, newAliasDto.newAlias);
    return this.aliasService.toAliasDto(newAliasDto.newAlias, false);
  }

  @Put(':alias')
  @OpenApi(
    {
      code: 200,
      description: 'The updated aliases',
      schema: AliasSchema,
    },
    403,
    404,
  )
  async makeAliasPrimary(
    @RequestUserId() userId: number,
    @Param('alias') alias: string,
    @Body() changeAliasDto: AliasUpdateDto,
  ): Promise<AliasDto> {
    if (!changeAliasDto.primaryAlias) {
      throw new BadRequestException(
        `This endpoint can only set an alias as primary, therefore the field 'primaryAlias' must be set to 'true'.`,
      );
    }
    const noteId = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(userId, noteId))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.makeAliasPrimary(noteId, alias);
    return this.aliasService.toAliasDto(alias, changeAliasDto.primaryAlias);
  }

  @Delete(':alias')
  @OpenApi(
    {
      code: 204,
      description: 'The aliases was deleted',
    },
    400,
    403,
    404,
  )
  async removeAlias(
    @RequestUserId() user: number,
    @Param('alias') alias: string,
  ): Promise<void> {
    const note = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(alias);
  }
}
