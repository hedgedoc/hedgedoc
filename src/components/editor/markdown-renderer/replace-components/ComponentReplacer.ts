import { DomElement } from 'domhandler'
import { ReactElement } from 'react'

export type SubNodeConverter = (node: DomElement, index: number) => ReactElement

export interface ComponentReplacer {
  getReplacement: (node: DomElement, index:number, subNodeConverter: SubNodeConverter) => (ReactElement|undefined)
}
