/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Facet } from '@codemirror/state'
import type { Text as YText } from 'yjs'

/**
 * Provides the latest given {@link YTextSyncPluginConfig} for a codemirror instance.
 */
export const yTextSyncPluginConfigFacet = Facet.define<YTextSyncPluginConfig, YTextSyncPluginConfig>({
  combine(inputs) {
    return inputs[inputs.length - 1]
  }
})

/**
 * Describes the configuration of a {@link YTextSyncPlugin} instance.
 */
export interface YTextSyncPluginConfig {
  readonly yText: YText
  readonly onPluginLoaded: () => void
}
