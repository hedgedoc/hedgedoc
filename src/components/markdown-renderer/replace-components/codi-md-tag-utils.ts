import { DomElement } from 'domhandler'

export const getAttributesFromCodiMdTag = (node: DomElement, tagName: string): ({ [s: string]: string; }|undefined) => {
  if (node.name !== `codimd-${tagName}` || !node.attribs) {
    return
  }
  return node.attribs
}
