import { DomElement } from 'domhandler'
import { ReactElement } from 'react'
import { SubNodeConverter } from '../../markdown-renderer'

const getElementReplacement = (node: DomElement, index: number, counterMap: Map<string, number>, nodeConverter: SubNodeConverter): (ReactElement | undefined) => {
  if (node.name === 'p' && node.children && node.children.length === 1) {
    const possibleTocDiv = node.children[0]
    if (possibleTocDiv.name === 'div' && possibleTocDiv.attribs && possibleTocDiv.attribs.class &&
      possibleTocDiv.attribs.class === 'table-of-contents' && possibleTocDiv.children && possibleTocDiv.children.length === 1) {
      const listElement = possibleTocDiv.children[0]
      listElement.attribs = Object.assign(listElement.attribs || {}, { class: 'table-of-contents' })
      return nodeConverter(listElement, index)
    }
  }
}

export { getElementReplacement as getTOCReplacement }
