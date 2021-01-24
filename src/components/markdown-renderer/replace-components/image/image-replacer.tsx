/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { ProxyImageFrame } from './proxy-image-frame'

export type ImageClickHandler = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;

export class ImageReplacer extends ComponentReplacer {
  private readonly clickHandler?: ImageClickHandler

  constructor (clickHandler?: ImageClickHandler) {
    super()
    this.clickHandler = clickHandler
  }

  public getReplacement (node: DomElement): React.ReactElement | undefined {
    if (node.name === 'img' && node.attribs) {
      return <ProxyImageFrame
        id={node.attribs.id}
        className={`${node.attribs.class} cursor-zoom-in`}
        src={node.attribs.src}
        alt={node.attribs.alt}
        title={node.attribs.title}
        width={node.attribs.width}
        height={node.attribs.height}
        onClick={this.clickHandler}
      />
    }
  }
}
