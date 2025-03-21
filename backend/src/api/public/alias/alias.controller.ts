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

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { AliasService } from '../../../notes/alias.service';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsService } from '../../../permissions/permissions.service';
import { User } from '../../../users/user.entity';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('alias')
@ApiSecurity('token')
@Controller('alias')
export class AliasController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private aliasService: AliasService,
    private noteService: NotesService,
    private permissionsService: PermissionsService,
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
    @RequestUser() user: User,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    const note = await this.noteService.getNoteByIdOrAlias(
      newAliasDto.noteIdOrAlias,
    );
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const updatedAlias = await this.aliasService.addAlias(
      note,
      newAliasDto.newAlias,
    );
    return this.aliasService.toAliasDto(updatedAlias, note);
  }

  @Put(':alias')
  @OpenApi(
    {
      code: 200,
      description: 'The updated alias',
      schema: AliasSchema,
    },
    403,
    404,
  )
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
    const note = await this.noteService.getNoteByIdOrAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const updatedAlias = await this.aliasService.makeAliasPrimary(note, alias);
    return this.aliasService.toAliasDto(updatedAlias, note);
  }

  @Delete(':alias')
  @OpenApi(
    {
      code: 204,
      description: 'The alias was deleted',
    },
    400,
    403,
    404,
  )
  async removeAlias(
    @RequestUser() user: User,
    @Param('alias') alias: AliasDto['name'],
  ): Promise<void> {
    const note = await this.noteService.getNoteByIdOrAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(note, alias);
  }
}
