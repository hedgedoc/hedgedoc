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
    const childIsPDF = node.children[0].name === 'codimd-pdf'
    if (!(childIsImage || childIsYoutube || childIsVimeo || childIsPDF)) {
      return
    }
    return (<p className='wider-possible'>
      {subNodeConverter(node, index)}
    </p>)
  }
}
