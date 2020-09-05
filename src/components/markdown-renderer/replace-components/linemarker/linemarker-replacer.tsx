import { DomElement } from 'domhandler'
import { ComponentReplacer } from '../ComponentReplacer'

export class LinemarkerReplacer extends ComponentReplacer {
  public getReplacement (codeNode: DomElement): null | undefined {
    return codeNode.name === 'app-linemarker' ? null : undefined
  }
}
