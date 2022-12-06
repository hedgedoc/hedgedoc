/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Facet } from '@codemirror/state'
import type { Text as YText } from 'yjs'

export class YTextSyncPluginConfig {
  public static syncPluginConfigFacet = Facet.define<YTextSyncPluginConfig, YTextSyncPluginConfig>({
    combine(inputs) {
      return inputs[inputs.length - 1]
    }
  })

  constructor(public readonly yText: YText, public readonly onPluginLoaded: () => void) {}
}
