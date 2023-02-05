/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class MissingTrailingSlashError extends Error {
  constructor() {
    super("Path doesn't end with a trailing slash")
  }
}

export class WrongProtocolError extends Error {
  constructor() {
    super('Protocol must be HTTP or HTTPS')
  }
}
