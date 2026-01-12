/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'requiredPermission';

/**
 * This decorator gathers the {@link PermissionLevel} a user must hold for the {@link PermissionsGuard}
 * @param permissionLevel the required permission for the decorated action
 * @returns The custom decorator action
 */
// oxlint-disable-next-line @typescript-eslint/naming-convention
export function RequirePermission(
  permissionLevel: PermissionLevel,
): CustomDecorator {
  return SetMetadata(PERMISSION_METADATA_KEY, permissionLevel);
}
