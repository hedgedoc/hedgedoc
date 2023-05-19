/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Represents the required access level a user needs to use a specific API endpoint.
 */
export enum RequiredPermission {
  READ = 'read',
  WRITE = 'write',
  OWNER = 'owner',
  CREATE = 'create',
}
