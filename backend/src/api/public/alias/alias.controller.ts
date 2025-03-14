/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AliasCreateDto,
  AliasDto,
  AliasSchema,
  AliasUpdateDto,
} from '@hedgedoc/commons';
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
import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { User } from '../../../database/types';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { RequestUserId } from '../../utils/decorator/request-user.decorator';
import { OpenApi } from '../../utils/openapi.decorator';

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
      description: 'The new aliases',
      schema: AliasSchema,
    },
    403,
    404,
  )
  async addAlias(
    @RequestUserId() userId: number,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    const note = await this.noteService.getNoteIdByAlias(
      newAliasDto.noteIdOrAlias,
    );
    if (!(await this.permissionsService.isOwner(userId, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const updatedAlias = await this.aliasService.addAlias(
      note,
      newAliasDto.newAlias,
    );
    return this.aliasService.toAliasDto(updatedAlias, note);
  }

  @Put(':aliases')
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
    @RequestUserId() user: User,
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
    @RequestUserId() user: User,
    @Param('alias') alias: AliasDto['name'],
  ): Promise<void> {
    const note = await this.noteService.getNoteIdByAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(note, alias);
  }
}
