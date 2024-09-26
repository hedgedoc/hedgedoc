/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { invertUnifiedPatch } from './invert-unified-patch'
import { parsePatch } from 'diff'

describe('invert unified patch', () => {
  it('inverts a patch correctly', () => {
    const parsedPatch = parsePatch(`--- a\t2022-07-03 21:21:07.499933337 +0200
+++ b\t2022-07-03 21:22:28.650972217 +0200
@@ -1,5 +1,4 @@
-a
-b
 c
 d
+d
 e`)[0]
    const result = invertUnifiedPatch(parsedPatch)
    expect(result).toMatchSnapshot()
  })
})
