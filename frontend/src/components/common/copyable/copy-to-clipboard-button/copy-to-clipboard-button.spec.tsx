/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { CopyToClipboardButton } from './copy-to-clipboard-button'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import * as uuidModule from 'uuid'

jest.mock('uuid')

describe('Copy to clipboard button', () => {
  const copyContent = 'Copy McCopy Content. Electric Copyloo'
  const uuidMock = '35a35a31-c259-48c4-b75a-8da99859dcdb' // https://xkcd.com/221/
  const overlayId = `copied_${uuidMock}`
  let originalClipboard: Clipboard

  beforeAll(async () => {
    await mockI18n()
    originalClipboard = window.navigator.clipboard
    jest.spyOn(uuidModule, 'v4').mockReturnValue(Buffer.from(uuidMock))
  })

  afterAll(() => {
    Object.assign(global.navigator, {
      clipboard: originalClipboard
    })
    jest.resetAllMocks()
    jest.resetModules()
  })

  const testButton = async (expectSuccess: boolean) => {
    const view = render(<CopyToClipboardButton content={copyContent} />)
    expect(view.container).toMatchSnapshot()
    const button = await screen.findByTitle('renderer.highlightCode.copyCode')
    act(() => {
      button.click()
    })
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(expectSuccess ? 'copyOverlay.success' : 'copyOverlay.error')
    expect(tooltip).toHaveAttribute('id', overlayId)
    expect(view.container).toMatchSnapshot()
  }

  const mockClipboard = (copyIsSuccessful: boolean): jest.Mock => {
    const writeTextToClipboardSpy = jest.fn(() =>
      copyIsSuccessful ? Promise.resolve() : Promise.reject(new Error('mocked clipboard failed'))
    )
    Object.assign(global.navigator, {
      clipboard: {
        writeText: writeTextToClipboardSpy
      }
    })
    return writeTextToClipboardSpy
  }

  it('shows an success text if writing succeeded', async () => {
    const writeTextToClipboardSpy = mockClipboard(true)
    await testButton(true)
    expect(writeTextToClipboardSpy).toHaveBeenCalledWith(copyContent)
  })

  it('shows an error text if writing failed', async () => {
    const writeTextToClipboardSpy = mockClipboard(false)
    await testButton(false)
    expect(writeTextToClipboardSpy).toHaveBeenCalledWith(copyContent)
  })

  it("show an error text if clipboard api isn't available", async () => {
    Object.assign(global.navigator, {
      clipboard: undefined
    })

    await testButton(false)
  })
})
