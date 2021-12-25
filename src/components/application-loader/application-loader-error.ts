/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export class ApplicationLoaderError extends Error {
  constructor(taskName: string) {
    super(`Task ${taskName} failed`)
  }
}
