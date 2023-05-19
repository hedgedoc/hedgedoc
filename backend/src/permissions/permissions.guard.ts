/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { extractNoteFromRequest } from '../api/utils/extract-note-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotesService } from '../notes/notes.service';
import { PermissionsService } from './permissions.service';
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
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private noteService: NotesService,
  ) {
    this.logger.setContext(PermissionsGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<RequiredPermission[]>(
      PERMISSION_METADATA_KEY,
      context.getHandler(),
    );
    // If no permissions are set this is probably an error and this guard should not let the request pass
    if (!permissions) {
      this.logger.error(
        'Could not find permission metadata. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues',
      );
      return false;
    }
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const user = request.user ?? null;
    // handle CREATE permissions, as this does not need any note
    if (permissions[0] === RequiredPermission.CREATE) {
      return this.permissionsService.mayCreate(user);
    }
    // Attention: This gets the note an additional time if used in conjunction with GetNoteInterceptor or NoteHeaderInterceptor
    const note = await extractNoteFromRequest(request, this.noteService);
    if (note === undefined) {
      this.logger.error(
        'Could not find noteIdOrAlias metadata. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues',
      );
      return false;
    }
    return await this.permissionsService.checkPermissionOnNote(
      permissions[0],
      user,
      note,
    );
  }
}
