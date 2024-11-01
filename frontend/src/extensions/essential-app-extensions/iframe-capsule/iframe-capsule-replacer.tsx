/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type {
  NativeRenderer,
  NodeReplacement,
  SubNodeTransform
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import type { Element } from 'domhandler'
import React from 'react'
import { Globe as IconGlobe } from 'react-bootstrap-icons'

/**
 * Capsules <iframe> elements with a click shield.
 *
 * @see ClickShield
 */
export class IframeCapsuleReplacer extends ComponentReplacer {
  replace(node: Element, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): NodeReplacement {
    return node.name !== 'iframe' ? (
      DO_NOT_REPLACE
    ) : (
      <ClickShield
        hoverIcon={IconGlobe}
        targetDescription={node.attribs.src}
        fallbackLink={node.attribs.src}
        data-cypress-id={'iframe-capsule-click-shield'}>
        <div className={'d-print-none'}>{nativeRenderer()}</div>
      </ClickShield>
    )
  }
}
