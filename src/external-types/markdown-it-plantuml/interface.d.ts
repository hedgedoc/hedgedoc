/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Renderer from 'markdown-it/lib/renderer'

export interface PlantumlOptions {
  openMarker: string
  closeMarker: string
  render: Renderer
  generateSource: (umlCode: string, pluginOptions: PlantumlOptions) => string
}
