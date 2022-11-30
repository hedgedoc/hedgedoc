/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import { Optional } from '@mrdrogdrog/optional'

export const replaceInContent = (currentContent: string, replaceable: string, replacement: string): ContentEdits => {
  return Optional.ofNullable(currentContent.indexOf(replaceable))
    .filter((index) => index > -1)
    .map((index) => [{ from: index, to: index + replaceable.length, insert: replacement }])
    .orElse([])
}
