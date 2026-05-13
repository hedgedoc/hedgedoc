/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RateLimitError } from '../../api/common/api-error'

/**
 * Custom {@link Error} class for the {@link ApplicationLoader}.
 */
export class ApplicationLoaderError extends Error {
  constructor(taskName: string, originalError: unknown) {
    let message = `The task ${taskName} failed`
    if (originalError instanceof RateLimitError) {
      message += `: You are being rate limited. Please try again ${originalError.getResetIn()}`
    }
    super(message)
  }
}
