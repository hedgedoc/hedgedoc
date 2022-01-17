/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { AliasCreateDto } from '../../../notes/alias-create.dto';
import { AliasUpdateDto } from '../../../notes/alias-update.dto';
import { AliasDto } from '../../../notes/alias.dto';
import { AliasService } from '../../../notes/alias.service';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsService } from '../../../permissions/permissions.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import {
  badRequestDescription,
  conflictDescription,
  notFoundDescription,
  unauthorizedDescription,
  unprocessableEntityDescription,
} from '../../utils/descriptions';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@ApiTags('alias')
@Controller('alias')
export class AliasController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private aliasService: AliasService,
    private noteService: NotesService,
    private userService: UsersService,
    private permissionsService: PermissionsService,
  ) {
    this.logger.setContext(AliasController.name);
  }

  @Post()
  @ApiConflictResponse({ description: conflictDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
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
  @ApiBadRequestResponse({ description: badRequestDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
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
  @HttpCode(204)
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  @ApiUnprocessableEntityResponse({
    description: unprocessableEntityDescription,
  })
  async removeAlias(
    @RequestUser() user: User,
    @Param('alias') alias: string,
  ): Promise<void> {
    const note = await this.noteService.getNoteByIdOrAlias(alias);
    if (!(await this.permissionsService.isOwner(user, note))) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.aliasService.removeAlias(note, alias);
    return;
  }
}
