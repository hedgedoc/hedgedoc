import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer, SubNodeConverter } from '../ComponentReplacer'

export class PossibleWiderReplacer implements ComponentReplacer {
  getReplacement (node: DomElement, index: number, subNodeConverter: SubNodeConverter): React.ReactElement | undefined {
    if (node.name !== 'p') {
      return
    }
    if (!node.children || node.children.length !== 1) {
      return
    }
    const childIsImage = node.children[0].name === 'img'
    const childIsYoutube = node.children[0].name === 'codimd-youtube'
    const childIsVimeo = node.children[0].name === 'codimd-vimeo'
    const childIsAsciinema = node.children[0].name === 'codimd-asciinema'
    const childIsPDF = node.children[0].name === 'codimd-pdf'
    if (!(childIsImage || childIsYoutube || childIsVimeo || childIsAsciinema || childIsPDF)) {
      return
    }

    // This appends the 'wider-possible' class to the node for a wider view in view-mode
    node.attribs = Object.assign(node.attribs || {}, { class: `wider-possible ${node.attribs?.class || ''}` })
    return subNodeConverter(node, index)
  }
}
