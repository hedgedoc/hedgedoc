/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Waits until all other pending promises are processed.
 *
 * NodeJS has a queue for async code that waits for being processed. This method adds a promise to the very end of this queue.
 * If the promise is resolved then this means that all other promises before it have been processed as well.
 *
 * @return A promise which resolves when all other promises have been processed
 */
export function waitForOtherPromisesToFinish(): Promise<void> {
  return new Promise((resolve) => process.nextTick(resolve))
}
