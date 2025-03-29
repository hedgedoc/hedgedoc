/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDisconnectOnUserLoginStatusChange } from './use-disconnect-on-user-login-status-change'
import type { LoginUserInfoDto, MessageTransporter } from '@hedgedoc/commons'
import { render } from '@testing-library/react'
import React, { Fragment } from 'react'
import { Mock } from 'ts-mockery'
import { mockAppState } from '../../../../test-utils/mock-app-state'

jest.mock('../../../../hooks/common/use-application-state')

describe('use logout on user change', () => {
  const TestComponent: React.FC<{ messageTransporter: MessageTransporter }> = ({ messageTransporter }) => {
    useDisconnectOnUserLoginStatusChange(messageTransporter)
    return <Fragment />
  }

  const mockUseApplicationState = (userLoggedIn: boolean) => {
    mockAppState({
      user: userLoggedIn ? Mock.of<LoginUserInfoDto>({}) : null
    })
  }

  let disconnectCallback: jest.Mock
  let messageTransporter: MessageTransporter

  beforeEach(() => {
    disconnectCallback = jest.fn()
    messageTransporter = Mock.of<MessageTransporter>({ disconnect: disconnectCallback })
  })

  it("doesn't disconnect if user is logged in before", () => {
    mockUseApplicationState(true)
    render(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).not.toBeCalled()
  })

  it("doesn't disconnect if user is not logged in before", () => {
    mockUseApplicationState(false)
    render(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).not.toBeCalled()
  })

  it('disconnects if user switches from logged in to logged out', () => {
    mockUseApplicationState(true)
    const view = render(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).not.toBeCalled()

    mockUseApplicationState(false)
    view.rerender(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).toBeCalled()
  })

  it('disconnects if user switches from logged out to logged in', () => {
    mockUseApplicationState(false)
    const view = render(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).not.toBeCalled()

    mockUseApplicationState(true)
    view.rerender(<TestComponent messageTransporter={messageTransporter} />)
    expect(disconnectCallback).toBeCalled()
  })
})
