/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { Splitter } from './splitter'
import { Mock } from 'ts-mockery'

describe('Splitter', () => {
  it('can render only the left pane', () => {
    const view = render(<Splitter showLeft={true} showRight={false} left={<>left</>} right={<>right</>} />)
    expect(view.container).toMatchSnapshot()
  })

  it('can render only the right pane', () => {
    const view = render(<Splitter showLeft={false} showRight={true} left={<>left</>} right={<>right</>} />)
    expect(view.container).toMatchSnapshot()
  })

  it('can render both panes', () => {
    const view = render(<Splitter showLeft={true} showRight={true} left={<>left</>} right={<>right</>} />)
    expect(view.container).toMatchSnapshot()
  })

  describe('resize', () => {
    beforeEach(() => {
      Object.defineProperty(window.HTMLDivElement.prototype, 'clientWidth', { value: 1920 })
      Object.defineProperty(window.HTMLDivElement.prototype, 'offsetLeft', { value: 0 })
    })

    it('can change size with mouse', async () => {
      const view = render(<Splitter showLeft={true} showRight={true} left={<>left</>} right={<>right</>} />)
      expect(view.container).toMatchSnapshot()
      const divider = await screen.findByTestId('splitter-divider')

      fireEvent.mouseDown(divider, {})
      fireEvent.mouseMove(window, Mock.of<MouseEvent>({ buttons: 1, clientX: 1920 }))
      fireEvent.mouseUp(window)
      expect(view.container).toMatchSnapshot()

      fireEvent.mouseDown(divider, {})
      fireEvent.mouseMove(window, Mock.of<MouseEvent>({ buttons: 1, clientX: 0 }))
      fireEvent.mouseUp(window)
      expect(view.container).toMatchSnapshot()

      fireEvent.mouseMove(window, Mock.of<MouseEvent>({ buttons: 1, clientX: 1920 }))
      expect(view.container).toMatchSnapshot()
    })

    it('can change size with touch', async () => {
      const view = render(<Splitter showLeft={true} showRight={true} left={<>left</>} right={<>right</>} />)
      expect(view.container).toMatchSnapshot()
      const divider = await screen.findByTestId('splitter-divider')

      fireEvent.touchStart(divider, {})
      fireEvent.touchMove(window, Mock.of<TouchEvent>({ touches: [{ clientX: 1920 }, { clientX: 200 }] }))
      fireEvent.touchEnd(window)
      expect(view.container).toMatchSnapshot()

      fireEvent.touchStart(divider, {})
      fireEvent.touchMove(window, Mock.of<TouchEvent>({ touches: [{ clientX: 0 }, { clientX: 100 }] }))
      fireEvent.touchCancel(window)
      expect(view.container).toMatchSnapshot()

      fireEvent.touchMove(window, Mock.of<TouchEvent>({ touches: [{ clientX: 500 }, { clientX: 900 }] }))
      expect(view.container).toMatchSnapshot()
    })
  })
})
