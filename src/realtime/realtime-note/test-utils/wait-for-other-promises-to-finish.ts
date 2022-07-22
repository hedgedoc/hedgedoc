/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Waits until all other pending promises are processed.
 */
export async function waitForOtherPromisesToFinish(): Promise<void> {
  return await new Promise((resolve) => process.nextTick(resolve));
}
