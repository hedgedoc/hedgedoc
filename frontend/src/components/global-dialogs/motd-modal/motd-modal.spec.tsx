/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as UseBaseUrlModule from '../../../hooks/common/use-base-url'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { testId } from '../../../utils/test-id'
import type { CommonModalProps } from '../../common/modals/common-modal'
import * as CommonModalModule from '../../common/modals/common-modal'
import * as RendererIframeModule from '../../common/renderer-iframe/renderer-iframe'
import { act, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { CachedMotdModal } from './cached-motd-modal'
import { MotdProvider } from '../../motd/motd-context'
import { describe, expect, it, vitest, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

vi.mock('../../common/modals/common-modal')
vi.mock('../../common/renderer-iframe/renderer-iframe')
vi.mock('../../../hooks/common/use-base-url')

describe('motd modal', () => {
  beforeAll(async () => {
    vitest.spyOn(UseBaseUrlModule, 'useBaseUrl').mockImplementation(() => 'https://example.org')
    await mockI18n()
  })

  afterAll(() => {
    vitest.resetAllMocks()
    vitest.resetModules()
  })

  beforeAll(() => {
    vitest.spyOn(CommonModalModule, 'CommonModal').mockImplementation((({ children, show }) => {
      return (
        <span>
          This is a mock implementation of a Modal: {show ? <dialog>{children}</dialog> : 'Modal is invisible'}
        </span>
      )
    }) as React.FC<PropsWithChildren<CommonModalProps>>)
    vitest.spyOn(RendererIframeModule, 'RendererIframe').mockImplementation((props) => {
      return (
        <span {...testId('motd-renderer')}>
          This is a mock implementation of a iframe renderer. Props: {JSON.stringify(props)}
        </span>
      )
    })
  })

  it('renders a modal if a motd was fetched and can dismiss it', async () => {
    const motd = {
      motdText: 'very important mock text!',
      lastModified: 'yesterday'
    }
    const view = render(
      <MotdProvider motd={motd}>
        <CachedMotdModal></CachedMotdModal>
      </MotdProvider>
    )
    await screen.findByTestId('motd-renderer')
    expect(view.container).toMatchSnapshot()

    const button = await screen.findByTestId('motd-dismiss')
    await act<void>(() => {
      button.click()
    })
    expect(view.container).toMatchSnapshot()
  })

  it("doesn't render a modal if no motd has been fetched", async () => {
    const view = render(
      <MotdProvider motd={undefined}>
        <CachedMotdModal></CachedMotdModal>
      </MotdProvider>
    )
    await screen.findByTestId('loaded not visible')
    expect(view.container).toMatchSnapshot()
  })
})
