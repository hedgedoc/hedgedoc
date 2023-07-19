/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EmojiClickEventDetail, NativeEmoji } from 'emoji-picker-element/shared'

/**
 * Extracts the first shortcode that is associated with a clicked emoji.
 *
 * @param emoji The click event data from the emoji picker
 * @return The found emoji short code
 */
export const extractEmojiShortCode = (emoji: EmojiClickEventDetail): string | undefined => {
  if (!emoji.emoji.shortcodes) {
    return undefined
  }
  let skinToneModifier = ''
  if ((emoji.emoji as NativeEmoji).skins && (emoji.skinTone as number) !== 0) {
    skinToneModifier = `:skin-tone-${emoji.skinTone as number}:`
  }
  return `:${emoji.emoji.shortcodes[0]}:${skinToneModifier}`
}
