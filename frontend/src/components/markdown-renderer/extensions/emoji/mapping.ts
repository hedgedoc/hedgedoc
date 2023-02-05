/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import emojiData from 'emoji-picker-element-data/en/emojibase/data.json'

interface EmojiEntry {
  shortcodes: string[]
  emoji: string
}

type ShortCodeMap = { [key: string]: string }

const shortCodeMap = (emojiData as unknown as EmojiEntry[]).reduce((reduceObject, emoji) => {
  emoji.shortcodes.forEach((shortcode) => {
    reduceObject[shortcode] = emoji.emoji
  })
  return reduceObject
}, {} as ShortCodeMap)

const emojiSkinToneModifierMap = [1, 2, 3, 4, 5].reduce((reduceObject, modifierValue) => {
  const lightSkinCode = 127995
  const codepoint = lightSkinCode + (modifierValue - 1)
  const shortcode = `skin-tone-${modifierValue}`
  reduceObject[shortcode] = `&#${codepoint};`
  return reduceObject
}, {} as ShortCodeMap)

export const combinedEmojiData = {
  ...shortCodeMap,
  ...emojiSkinToneModifierMap
}
