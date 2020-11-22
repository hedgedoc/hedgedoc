/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface EmojiOptions {
  defs?: { [key: string]: string },
  enabled: string[],
  shortcuts?: { [key: string]: string }
}
