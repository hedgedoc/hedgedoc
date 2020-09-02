import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { AsciinemaFrame } from './asciinema-frame'

export class AsciinemaReplacer extends ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  public getReplacement (node: DomElement, index: number): React.ReactElement | undefined {
    const attributes = getAttributesFromCodiMdTag(node, 'asciinema')
    if (attributes && attributes.id) {
      const asciinemaId = attributes.id
      const count = (this.counterMap.get(asciinemaId) || 0) + 1
      this.counterMap.set(asciinemaId, count)
      return (
        <AsciinemaFrame key={index} id={asciinemaId}/>
      )
    }
  }
}
