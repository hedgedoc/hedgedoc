/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NotInDBError extends Error {
  name = 'NotInDBError';
}

export class ClientError extends Error {
  name = 'ClientError';
}

export class PermissionError extends Error {
  name = 'PermissionError';
}
