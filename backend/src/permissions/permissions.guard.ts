/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { extractNoteIdFromRequest } from '../api/utils/extract-note-id-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NoteService } from '../notes/note.service';
import { PermissionService } from './permission.service';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';

/**
 * This guard protects controller methods from access if the user has not the appropriate permissions.
 * The permissions are set via the RequiredPermission decorator in addition to this guard.
 *
 * The permission levels DENY, READ and WRITE are only evaluated when a noteId is present in the request.
 * The meaning of the FULL permission level differs on the fact if the request contains a noteId or not:
 * If there is a noteId present, the FULL permission level means ownership of the note is required.
 * If there is no noteId present, the FULL permission level means that a note should be created.
 * Since HedgeDoc can be configured to forbid note creation by guests, the config needs to be evaluated in that case.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionService,
    @Inject(forwardRef(() => NoteService))
    private readonly noteService: NoteService,
  ) {
    this.logger.setContext(PermissionsGuard.name);
  }

  /**
   * Checks if the user has the required permissions to access the requested resource (note).
   * If the userId is not set, the request is considered unauthenticated and blocked.
   * If no noteId can be extracted from the request and the required permission level is FULL
   * (meaning the user wants to create a note), it checks if the user may create a note.
   *
   * @param context The execution context of the request
   * @returns A promise that resolves to true if the user has the required permissions, false otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccessLevel = this.extractRequiredPermission(context);
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const userId = request.userId;
    if (userId === undefined) {
      // If the userId is not set, the request is not authenticated
      // This should never happen, as the SessionGuard should have protected this route
      return false;
    }

    const noteId = await extractNoteIdFromRequest(request, this.noteService);
    if (noteId === undefined) {
      if (requiredAccessLevel === PermissionLevel.FULL) {
        return await this.permissionsService.checkIfUserMayCreateNote(userId);
      } else {
        this.logger.error(
          'Could not find noteId for permission check. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues',
        );
        return false;
      }
    }

    const userPermissionForNote = await this.permissionsService.determinePermission(userId, noteId);
    return userPermissionForNote >= requiredAccessLevel;
  }

  /**
   * Extracts the required permission level from the metadata of the handler.
   * If no permission level is set, an error is thrown.
   *
   * @param context The execution context of the request
   * @returns The required permission level as defined
   */
  private extractRequiredPermission(context: ExecutionContext): PermissionLevel {
    const requiredPermission = this.reflector.get<PermissionLevel>(
      PERMISSION_METADATA_KEY,
      context.getHandler(),
    );
    // If no requiredPermission are set this is probably an error and this guard should not let the request pass
    if (requiredPermission === undefined) {
      const message =
        'Could not find requiredPermission metadata. This should never happen. If you see this, please open an issue at https://github.com/hedgedoc/hedgedoc/issues';
      this.logger.error(message);
      throw new Error(message);
    }
    return requiredPermission;
  }
}
