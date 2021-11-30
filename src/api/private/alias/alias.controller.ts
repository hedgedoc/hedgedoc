/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../../../errors/errors';
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
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
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
  async addAlias(
    @RequestUser() user: User,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    try {
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
    } catch (e) {
      if (e instanceof AlreadyInDBError) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Put(':alias')
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
    try {
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!(await this.permissionsService.isOwner(user, note))) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const updatedAlias = await this.aliasService.makeAliasPrimary(
        note,
        alias,
      );
      return this.aliasService.toAliasDto(updatedAlias, note);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Delete(':alias')
  @HttpCode(204)
  async removeAlias(
    @RequestUser() user: User,
    @Param('alias') alias: string,
  ): Promise<void> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!(await this.permissionsService.isOwner(user, note))) {
        throw new UnauthorizedException('Reading note denied!');
      }
      await this.aliasService.removeAlias(note, alias);
      return;
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof PrimaryAliasDeletionForbiddenError) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }
}
