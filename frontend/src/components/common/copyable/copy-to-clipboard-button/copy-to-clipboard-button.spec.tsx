/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../markdown-renderer/test-utils/mock-i18n'
import { CopyToClipboardButton } from './copy-to-clipboard-button'
import { act, render, screen } from '@testing-library/react'
import * as uuidModule from 'uuid'

jest.mock('uuid')

describe('Copy to clipboard button', () => {
  const copyContent = 'Copy McCopy Content. Electric Copyloo'
  const copyToClipboardButton = <CopyToClipboardButton content={copyContent} />
  const uuidMock = '35a35a31-c259-48c4-b75a-8da99859dcdb' // https://xkcd.com/221/
  const overlayId = `copied_${uuidMock}`

  const mockClipboard = async (copyIsSuccessful: boolean, testFunction: () => Promise<void>) => {
    const originalClipboard = window.navigator.clipboard
    const writeTextMock = jest.fn().mockImplementation(() => (copyIsSuccessful ? Promise.resolve() : Promise.reject()))
    Object.assign(global.navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })

    try {
      await testFunction()
      expect(writeTextMock).toHaveBeenCalledWith(copyContent)
    } finally {
      Object.assign(global.navigator, {
        clipboard: originalClipboard
      })
    }
  }

  const testButton = async (expectSuccess: boolean) => {
    const view = render(copyToClipboardButton)
    expect(view.container).toMatchSnapshot()
    const button = await screen.findByTitle('renderer.highlightCode.copyCode')
    await act<void>(() => {
      button.click()
    })
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(expectSuccess ? 'copyOverlay.success' : 'copyOverlay.error')
    expect(tooltip).toHaveAttribute('id', overlayId)
    expect(view.container).toMatchSnapshot()
  }

  beforeAll(async () => {
    await mockI18n()
    jest.spyOn(uuidModule, 'v4').mockReturnValue(uuidMock)
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('shows an success text if writing succeeded', () => mockClipboard(true, () => testButton(true)))
  it('shows an error text if writing failed', () => mockClipboard(false, () => testButton(false)))
  it("show an error text if clipboard api isn't available", () => testButton(false))
})
