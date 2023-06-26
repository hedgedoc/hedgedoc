/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { concatCssClasses } from '../../../../../utils/concat-css-classes'
import { createCursorCssClass } from './create-cursor-css-class'
import styles from './style.module.scss'
import type { SelectionRange } from '@codemirror/state'
import type { EditorView, LayerMarker, Rect } from '@codemirror/view'
import { Direction } from '@codemirror/view'

/**
 * Renders a blinking cursor to indicate the cursor of another user.
 */
export class RemoteCursorMarker implements LayerMarker {
  constructor(
    private left: number,
    private top: number,
    private height: number,
    private name: string,
    private styleIndex: number,
    private viewWidth: number
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
    const cursorOnRightSide = this.left > this.viewWidth / 2
    const cursorOnDownSide = this.top < 20
    element.className = concatCssClasses(styles.cursor, createCursorCssClass(this.styleIndex), {
      [styles.right]: cursorOnRightSide,
      [styles.down]: cursorOnDownSide
    })
  }

  eq(other: RemoteCursorMarker): boolean {
    return (
      this.left === other.left && this.top === other.top && this.height === other.height && this.name === other.name
    )
  }

  public static createCursor(
    view: EditorView,
    position: SelectionRange,
    displayName: string,
    styleIndex: number
  ): RemoteCursorMarker[] {
    const absolutePosition = this.calculateAbsoluteCursorPosition(position, view)
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
        displayName,
        styleIndex,
        rect.width
      )
    ]
  }

  private static calculateAbsoluteCursorPosition(position: SelectionRange, view: EditorView): Rect | null {
    const cappedPositionHead = Math.max(0, Math.min(view.state.doc.length, position.head))
    return view.coordsAtPos(cappedPositionHead, position.assoc || 1)
  }
}
