import { DomElement } from 'domhandler'

export const getAttributesFromHedgeDocTag = (node: DomElement, tagName: string): ({ [s: string]: string; }|undefined) => {
  if (node.name !== `app-${tagName}` || !node.attribs) {
    return
  }
  return node.attribs
}
