/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { ImageFrame } from './image-frame'

export class ImageReplacer extends ComponentReplacer {
  public getReplacement (node: DomElement): React.ReactElement | undefined {
    if (node.name === 'img' && node.attribs) {
      return <ImageFrame
        id={node.attribs.id}
        className={node.attribs.class}
        src={node.attribs.src}
        alt={node.attribs.alt}
        title={node.attribs.title}
        width={node.attribs.width}
        height={node.attribs.height}
      />
    }
  }
}
