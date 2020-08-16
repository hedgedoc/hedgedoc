import { DomElement } from 'domhandler'
import { ComponentReplacer, SubNodeConverter } from '../ComponentReplacer'

export class TocReplacer implements ComponentReplacer {
  getReplacement (node: DomElement, index: number, subNodeConverter: SubNodeConverter): React.ReactElement | undefined {
    if (node.name !== 'p' || node.children?.length !== 1) {
      return
    }
    const possibleTocDiv = node.children[0]
    if (possibleTocDiv.name === 'div' && possibleTocDiv.attribs && possibleTocDiv.attribs.class &&
        possibleTocDiv.attribs.class === 'table-of-contents' && possibleTocDiv.children && possibleTocDiv.children.length === 1) {
      const listElement = possibleTocDiv.children[0]
      listElement.attribs = Object.assign(listElement.attribs || {}, { class: 'table-of-contents' })
      return subNodeConverter(listElement, index)
    }
  }
}
