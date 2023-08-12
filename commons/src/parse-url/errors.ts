/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoSubdirectoryAllowedError extends Error {
  constructor() {
    super('Subdirectories are not allowed')
  }
}

export class WrongProtocolError extends Error {
  constructor() {
    super('Protocol must be HTTP or HTTPS')
  }
}
