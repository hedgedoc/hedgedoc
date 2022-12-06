/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createCursorCssClass } from './create-cursor-css-class'
import styles from './style.module.scss'
import type { SelectionRange } from '@codemirror/state'
import type { LayerMarker, EditorView } from '@codemirror/view'
import { Direction } from '@codemirror/view'

export class RemoteCursorMarker implements LayerMarker {
  constructor(
    private left: number,
    private top: number,
    private height: number,
    private name: string,
    private styleIndex: number
  ) {}

  draw(): HTMLElement {
    const elt = document.createElement('div')
    this.adjust(elt)
    return elt
  }

  update(elt: HTMLElement): boolean {
    this.adjust(elt)
    return true
  }

  adjust(element: HTMLElement) {
    element.style.left = `${this.left}px`
    element.style.top = `${this.top}px`
    element.style.height = `${this.height}px`
    element.style.setProperty('--name', `"${this.name}"`)
    element.className = `${styles.cursor} ${createCursorCssClass(this.styleIndex)}`
  }

  eq(other: RemoteCursorMarker): boolean {
    return (
      this.left === other.left && this.top === other.top && this.height === other.height && this.name === other.name
    )
  }

  public static createCursor(
    view: EditorView,
    position: SelectionRange,
    name: string,
    styleIndex: number
  ): RemoteCursorMarker[] {
    const absolutePosition = view.coordsAtPos(position.head, position.assoc || 1)
    if (!absolutePosition || styleIndex < 0) {
      return []
    }
    const rect = view.scrollDOM.getBoundingClientRect()
    const left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth
    const baseLeft = left - view.scrollDOM.scrollLeft
    const baseTop = rect.top - view.scrollDOM.scrollTop
    return [
      new RemoteCursorMarker(
        absolutePosition.left - baseLeft,
        absolutePosition.top - baseTop,
        absolutePosition.bottom - absolutePosition.top,
        name,
        styleIndex
      )
    ]
  }
}
