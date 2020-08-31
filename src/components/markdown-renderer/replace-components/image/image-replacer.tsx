import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { ImageFrame } from './image-frame'

export class ImageReplacer implements ComponentReplacer {
  getReplacement (node: DomElement, index: number): React.ReactElement | undefined {
    if (node.name === 'img' && node.attribs) {
      return <ImageFrame
        key={index}
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
