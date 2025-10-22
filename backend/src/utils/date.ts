/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function interpretDateTimeAsIsoDateTime(input: string): string {
  return new Date(`${input} GMT+00:00`).toISOString();
}
