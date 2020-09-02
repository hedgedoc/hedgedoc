import { DomElement } from 'domhandler'
import { ReactElement } from 'react'

export type SubNodeTransform = (node: DomElement, index: number) => ReactElement | void | null

export type NativeRenderer = (node: DomElement, key: number) => ReactElement

export abstract class ComponentReplacer {
  public abstract getReplacement(node: DomElement, index: number, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): (ReactElement | null | undefined);
}
