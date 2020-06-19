import { DomElement } from 'domhandler'

export const getIdFromCodiMdTag = (node: DomElement, tagName: string): (string | undefined) => {
  if (node.name !== `codimd-${tagName}` || !node.attribs || !node.attribs.id) {
    return
  }
  return node.attribs.id
}

export interface VideoFrameProps {
  id: string
}
