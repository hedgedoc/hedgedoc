import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { ImageFrame } from './image-frame'

export class ImageReplacer implements ComponentReplacer {
  getReplacement (node: DomElement): React.ReactElement | undefined {
    if (node.name === 'img' && node.attribs) {
      return <ImageFrame
        id={node.attribs.id}
        className={node.attribs.class}
        src={node.attribs.src}
        alt={node.attribs.alt}
        width={node.attribs.width}
        height={node.attribs.height}
      />
    }
  }
}
