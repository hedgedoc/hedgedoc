import { DomElement } from 'domhandler'
import { ComponentReplacer } from '../ComponentReplacer'

export class CodimdLinemarkerReplacer extends ComponentReplacer {
  public getReplacement (codeNode: DomElement, index: number): null | undefined {
    return codeNode.name === 'codimd-linemarker' ? null : undefined
  }
}
