/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { EventEmittingProxyImageFrame } from './event-emitting-proxy-image-frame'
import { ProxyImageFrame } from './proxy-image-frame'
import { isTag, type Element } from 'domhandler'
import React from 'react'
import { concatCssClasses } from '../../../../utils/concat-css-classes'

export type ImageClickHandler = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => void

/**
 * Traverses the DOM upwards to check if one parent element of the current one is a link.
 * Stops when reaching the body element.
 *
 * @param node The node from which to start checking.
 * @returns true if the given node has some link parent in the DOM, false otherwise
 */
const isDescendantOfLink = (node: Element): boolean => {
  let parent = node.parent
  while (parent) {
    if (isTag(parent) && parent.name === 'a') {
      return true
    }
    if (isTag(parent) && parent.name === 'body') {
      return false
    }
    parent = parent.parent
  }
  return false
}

/**
 * Detects image tags and loads them via image proxy if configured.
 */
export class ProxyImageReplacer extends ComponentReplacer {
  public replace(node: Element): NodeReplacement {
    if (node.name !== 'img') {
      return DO_NOT_REPLACE
    }

    const linkedImage = isDescendantOfLink(node)
    const ImageFrame = linkedImage ? ProxyImageFrame : EventEmittingProxyImageFrame
    return (
      <ImageFrame
        id={node.attribs.id}
        className={concatCssClasses(node.attribs.class, {
          'cursor-zoom-in': !linkedImage
        })}
        src={node.attribs.src}
        alt={node.attribs.alt}
        title={node.attribs.title}
        width={node.attribs.width}
        height={node.attribs.height}
      />
    )
  }
}
