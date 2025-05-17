/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser } from '@hedgedoc/database';
import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { extractNoteIdFromRequest } from '../api/utils/extract-note-id-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NoteService } from '../notes/note.service';
import { UsersService } from '../users/users.service';
import { NotePermissionLevel } from './note-permission.enum';
import { PermissionService } from './permission.service';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';
import { RequiredPermission } from './required-permission.enum';

/**
 * This guards controller methods from access, if the user has not the appropriate permissions.
 * The permissions are set via the {@link Permissions} decorator in addition to this guard.
 * If the check permission is not CREATE the method needs to extract the noteIdOrAlias from
 * request.params['noteIdOrAlias'] or request.headers['hedgedoc-note'] to check if the user has the permission.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => NoteService))
    private readonly noteService: NoteService,
  ) {
    this.logger.setContext(PermissionsGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccessLevel = this.extractRequiredPermission(context);
    if (requiredAccessLevel === undefined) {
      return false;
    }
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const userId = request.userId;
    if (userId === undefined) {
      return false;
    }

    // handle CREATE requiredAccessLevel, as this does not need any note
    if (requiredAccessLevel === RequiredPermission.CREATE) {
      const username = (await this.userService.getUserById(userId))[
        FieldNameUser.username
      ];
      return this.permissionsService.mayCreate(username);
    }

    const noteId = await extractNoteIdFromRequest(request, this.noteService);
    if (noteId === undefined) {
      this.logger.error(
        'Could not find noteIdOrAlias metadata. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues',
      );
      return false;
    }

    return this.isNotePermissionFulfillingRequiredAccessLevel(
      requiredAccessLevel,
      await this.permissionsService.determinePermission(userId, noteId),
    );
  }

  private extractRequiredPermission(
    context: ExecutionContext,
  ): RequiredPermission | undefined {
    const requiredPermission = this.reflector.get<RequiredPermission>(
      PERMISSION_METADATA_KEY,
      context.getHandler(),
    );
    // If no requiredPermission are set this is probably an error and this guard should not let the request pass
    if (!requiredPermission) {
      this.logger.error(
        'Could not find requiredPermission metadata. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues',
      );
      return undefined;
    }
    return requiredPermission;
  }

  private isNotePermissionFulfillingRequiredAccessLevel(
    requiredAccessLevel: Exclude<RequiredPermission, RequiredPermission.CREATE>,
    actualNotePermission: NotePermissionLevel,
  ): boolean {
    switch (requiredAccessLevel) {
      case RequiredPermission.READ:
        return actualNotePermission >= NotePermissionLevel.READ;
      case RequiredPermission.WRITE:
        return actualNotePermission >= NotePermissionLevel.WRITE;
      case RequiredPermission.OWNER:
        return actualNotePermission >= NotePermissionLevel.OWNER;
    }
  }
}
