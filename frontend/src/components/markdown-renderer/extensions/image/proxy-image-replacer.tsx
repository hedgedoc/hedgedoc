/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { EventEmittingProxyImageFrame } from './event-emitting-proxy-image-frame'
import type { Element } from 'domhandler'
import React from 'react'

export type ImageClickHandler = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => void

/**
 * Detects image tags and loads them via image proxy if configured.
 */
export class ProxyImageReplacer extends ComponentReplacer {
  public replace(node: Element): NodeReplacement {
    return node.name !== 'img' ? (
      DO_NOT_REPLACE
    ) : (
      <EventEmittingProxyImageFrame
        id={node.attribs.id}
        className={`${node.attribs.class} cursor-zoom-in`}
        src={node.attribs.src}
        alt={node.attribs.alt}
        title={node.attribs.title}
        width={node.attribs.width}
        height={node.attribs.height}
      />
    )
  }
}
