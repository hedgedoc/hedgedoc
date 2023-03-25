/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { NotesService } from '../../notes/notes.service';
import { Permission } from '../../permissions/permissions.enum';
import { PermissionsService } from '../../permissions/permissions.service';
import { getNote } from './get-note.interceptor';
import { CompleteRequest } from './request.type';

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
    const permissions = this.reflector.get<Permission[]>(
      'permissions',
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
    if (permissions[0] === Permission.CREATE) {
      return this.permissionsService.mayCreate(user);
    }
    // Get the note from the parameter noteIdOrAlias or the http header hedgedoc-note
    // Attention: This gets the note an additional time if used in conjunction with GetNoteInterceptor or NoteHeaderInterceptor
    let noteIdOrAlias = request.params['noteIdOrAlias'];
    if (noteIdOrAlias === undefined)
      noteIdOrAlias = request.headers['hedgedoc-note'] as string;
    const note = await getNote(this.noteService, noteIdOrAlias);
    switch (permissions[0]) {
      case Permission.READ:
        return await this.permissionsService.mayRead(user, note);
      case Permission.WRITE:
        return await this.permissionsService.mayWrite(user, note);
      case Permission.OWNER:
        return await this.permissionsService.isOwner(user, note);
    }
    return false;
  }
}
