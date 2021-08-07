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
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { AliasCreateDto } from '../../../notes/alias-create.dto';
import { AliasUpdateDto } from '../../../notes/alias-update.dto';
import { AliasDto } from '../../../notes/alias.dto';
import { AliasService } from '../../../notes/alias.service';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsService } from '../../../permissions/permissions.service';
import { UsersService } from '../../../users/users.service';

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
    @Req() req: Request,
    @Body() newAliasDto: AliasCreateDto,
  ): Promise<AliasDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(
        newAliasDto.noteIdOrAlias,
      );
      if (!this.permissionsService.isOwner(user, note)) {
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
    @Req() req: Request,
    @Param('alias') alias: string,
    @Body() changeAliasDto: AliasUpdateDto,
  ): Promise<AliasDto> {
    if (!changeAliasDto.primaryAlias) {
      throw new BadRequestException(
        `The field 'primaryAlias' must be set to 'true'.`,
      );
    }
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!this.permissionsService.isOwner(user, note)) {
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
    @Req() req: Request,
    @Param('alias') alias: string,
  ): Promise<void> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!this.permissionsService.isOwner(user, note)) {
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
