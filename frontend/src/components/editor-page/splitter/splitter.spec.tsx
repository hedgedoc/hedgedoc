/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Splitter } from './splitter'
import { fireEvent, render, screen } from '@testing-library/react'
import { Mock } from 'ts-mockery'
import * as EditorConfigModule from '../../../redux/editor-config/methods'
import { mockAppState } from '../../../test-utils/mock-app-state'
import type { EditorConfig } from '../../../redux/editor-config/types'

jest.mock('../../../hooks/common/use-application-state')
jest.mock('../../../redux/editor-config/methods')

const setEditorSplitPosition = jest.spyOn(EditorConfigModule, 'setEditorSplitPosition').mockReturnValue()

const findMoveOverlay = (container: HTMLElement): Element => {
  const overlay = container.querySelector('.move-overlay')

  if (!overlay) {
    throw new Error('Move overlay was not rendered')
  }

  return overlay
}

const findGrabber = (container: HTMLElement): Element => {
  const grabber = container.querySelector('.grabber')

  if (!grabber) {
    throw new Error('Grabber was not rendered')
  }

  return grabber
}

describe('Splitter', () => {
  describe('resize', () => {
    beforeEach(() => {
      Object.defineProperty(window.HTMLDivElement.prototype, 'clientWidth', { value: 1920 })
      Object.defineProperty(window.HTMLDivElement.prototype, 'offsetLeft', { value: 0 })
    })

    it('can react to shortcuts', () => {
      render(<Splitter left={<>left</>} right={<>right</>} />)

      fireEvent.keyDown(document, Mock.of<KeyboardEvent>({ ctrlKey: true, altKey: true, key: 'v' }))
      expect(setEditorSplitPosition).toHaveBeenCalledWith(0)

      fireEvent.keyDown(document, Mock.of<KeyboardEvent>({ ctrlKey: true, altKey: true, key: 'e' }))
      expect(setEditorSplitPosition).toHaveBeenCalledWith(100)

      fireEvent.keyDown(document, Mock.of<KeyboardEvent>({ ctrlKey: true, altKey: true, key: 'b' }))
      expect(setEditorSplitPosition).toHaveBeenCalledWith(50)
    })

    it('can change size with mouse', async () => {
      mockAppState({
        editorConfig: { splitPosition: 50 } as EditorConfig
      })
      const view = render(<Splitter left={<>left</>} right={<>right</>} />)
      expect(view.container).toMatchSnapshot()
      const divider = await screen.findByTestId('splitter-divider')

      fireEvent.mouseDown(divider, {})
      let moveOverlay = findMoveOverlay(view.container)
      fireEvent.mouseMove(moveOverlay, Mock.of<MouseEvent>({ buttons: 1, clientX: 1920 }))
      fireEvent.mouseUp(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(100)

      fireEvent.mouseDown(divider, {})
      moveOverlay = findMoveOverlay(view.container)
      fireEvent.mouseMove(moveOverlay, Mock.of<MouseEvent>({ buttons: 1, clientX: 0 }))
      fireEvent.mouseUp(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(0)

      const grabber = findGrabber(view.container)
      fireEvent.mouseDown(grabber, {})
      moveOverlay = findMoveOverlay(view.container)
      fireEvent.mouseMove(moveOverlay, Mock.of<MouseEvent>({ buttons: 1, clientX: 960 }))
      fireEvent.mouseUp(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(50)

      fireEvent.mouseMove(window, Mock.of<MouseEvent>({ buttons: 1, clientX: 1920 }))
      expect(setEditorSplitPosition).toHaveBeenCalledWith(100)
    })

    it('can change size with touch', async () => {
      const view = render(<Splitter left={<>left</>} right={<>right</>} />)
      expect(view.container).toMatchSnapshot('touch initial')
      const divider = await screen.findByTestId('splitter-divider')
      const target: EventTarget = Mock.of<EventTarget>()
      const defaultTouchEvent: Omit<Touch, 'clientX'> = {
        clientY: 0,
        target: target,
        identifier: 0,
        pageX: 0,
        pageY: 0,
        screenX: 0,
        screenY: 0,
        force: 0,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0
      }

      fireEvent.touchStart(divider, {})
      let moveOverlay = findMoveOverlay(view.container)
      fireEvent.touchMove(
        moveOverlay,
        Mock.of<TouchEvent>({
          touches: [
            { ...defaultTouchEvent, clientX: 1920 },
            { ...defaultTouchEvent, clientX: 200 }
          ]
        })
      )
      fireEvent.touchEnd(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(100)
      expect(view.container).toMatchSnapshot('touch move to left')

      fireEvent.touchStart(divider, {})
      moveOverlay = findMoveOverlay(view.container)
      fireEvent.touchMove(
        moveOverlay,
        Mock.of<TouchEvent>({
          touches: [
            { ...defaultTouchEvent, clientX: 0 },
            { ...defaultTouchEvent, clientX: 100 }
          ]
        })
      )
      fireEvent.touchCancel(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(0)
      expect(view.container).toMatchSnapshot('touch move to right')

      const grabber = findGrabber(view.container)
      fireEvent.touchStart(grabber, {})
      moveOverlay = findMoveOverlay(view.container)
      fireEvent.touchMove(
        moveOverlay,
        Mock.of<TouchEvent>({
          touches: [
            { ...defaultTouchEvent, clientX: 500 },
            { ...defaultTouchEvent, clientX: 900 }
          ]
        })
      )
      fireEvent.touchEnd(moveOverlay)
      expect(setEditorSplitPosition).toHaveBeenCalledWith(expect.closeTo(26, 1))
      expect(view.container).toMatchSnapshot('touch move to middle')
    })
  })
})
