/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NativeRenderer, NodeReplacement, SubNodeTransform } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import type { Element } from 'domhandler'
import React, { Fragment } from 'react'

export class TestReplacer extends ComponentReplacer {
  replace(node: Element, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): NodeReplacement {
    return node.tagName === 'node-processor' ? (
      <Fragment>
        <span>NodeProcessor! </span>
        <span data-children={true}> {node.childNodes.map(subNodeTransform)} </span>
        <span data-native={true}> {nativeRenderer()} </span>
      </Fragment>
    ) : (
      DO_NOT_REPLACE
    )
  }
}
