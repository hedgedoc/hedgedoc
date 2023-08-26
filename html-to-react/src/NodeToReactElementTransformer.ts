/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Node } from 'domhandler'
import { ReactElement } from 'react'

export interface NodeToReactElementTransformer {
  (
    node: Node,
    index: number | string,
    transform?: NodeToReactElementTransformer
  ): ReactElement | void | null | string
}
