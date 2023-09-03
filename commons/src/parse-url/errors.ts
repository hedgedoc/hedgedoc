/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Thrown if an {@link URL} contains a subdirectory.
 */
export class NoSubdirectoryAllowedError extends Error {
  constructor() {
    super('Subdirectories are not allowed')
  }
}

/**
 * Thrown if the protocol of an {@link URL} isn't https or http.
 */
export class WrongProtocolError extends Error {
  constructor() {
    super('Protocol must be HTTP or HTTPS')
  }
}

/**
 * Thrown if a value isn't a valid {@link URL}.
 */
export class NoValidUrlError extends Error {
  constructor(varName: string) {
    super(`${varName} is no valid URL`)
  }
}
