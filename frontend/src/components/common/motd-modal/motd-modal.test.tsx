/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MotdModal } from './motd-modal'
import { act, render, screen } from '@testing-library/react'
import * as fetchMotdModule from './fetch-motd'
import type { CommonModalProps } from '../modals/common-modal'
import * as CommonModalModule from '../modals/common-modal'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import * as RenderIframeModule from '../../editor-page/renderer-pane/render-iframe'
import { testId } from '../../../utils/test-id'
import * as UseBaseUrlModule from '../../../hooks/common/use-base-url'

jest.mock('./fetch-motd')
jest.mock('../modals/common-modal')
jest.mock('../../editor-page/renderer-pane/render-iframe')
jest.mock('../../../hooks/common/use-base-url')

describe('motd modal', () => {
  beforeAll(async () => {
    jest.spyOn(UseBaseUrlModule, 'useBaseUrl').mockImplementation(() => 'https://example.org')
    await mockI18n()
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeAll(() => {
    jest.spyOn(CommonModalModule, 'CommonModal').mockImplementation((({ children, show }) => {
      return (
        <span>
          This is a mock implementation of a Modal: {show ? <dialog>{children}</dialog> : 'Modal is invisible'}
        </span>
      )
    }) as React.FC<PropsWithChildren<CommonModalProps>>)
    jest.spyOn(RenderIframeModule, 'RenderIframe').mockImplementation((props) => {
      return (
        <span {...testId('motd-renderer')}>
          This is a mock implementation of a iframe renderer. Props: {JSON.stringify(props)}
        </span>
      )
    })
  })

  it('renders a modal if a motd was fetched and can dismiss it', async () => {
    jest.spyOn(fetchMotdModule, 'fetchMotd').mockImplementation(() => {
      return Promise.resolve({
        motdText: 'very important mock text!',
        lastModified: 'yesterday'
      })
    })
    const view = render(<MotdModal></MotdModal>)
    await screen.findByTestId('motd-renderer')
    expect(view.container).toMatchSnapshot()

    const button = await screen.findByTestId('motd-dismiss')
    act(() => {
      button.click()
    })
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render a modal if no motd has been fetched", async () => {
    jest.spyOn(fetchMotdModule, 'fetchMotd').mockImplementation(() => {
      return Promise.resolve(undefined)
    })
    const view = render(<MotdModal></MotdModal>)
    await screen.findByTestId('loaded not visible')
    expect(view.container).toMatchSnapshot()
  })
})
