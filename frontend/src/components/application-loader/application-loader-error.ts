/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Custom {@link Error} class for the {@link ApplicationLoader}.
 */
export class ApplicationLoaderError extends Error {
  constructor(taskName: string) {
    super(`The task ${taskName} failed`)
  }
}
