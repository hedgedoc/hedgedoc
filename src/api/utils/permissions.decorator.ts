/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { Permission } from '../../permissions/permissions.enum';

/**
 * This decorator gathers the {@link Permission Permission} a user must hold for the {@link PermissionsGuard}
 * @param permissions - an array of permissions. In practice this should always contain exactly one {@link Permission}
 * @constructor
 */
// eslint-disable-next-line func-style,@typescript-eslint/naming-convention
export const Permissions = (...permissions: Permission[]): CustomDecorator =>
  SetMetadata('permissions', permissions);
