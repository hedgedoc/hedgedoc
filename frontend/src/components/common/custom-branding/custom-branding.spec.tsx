/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigDto } from '@hedgedoc/commons'
import * as UseFrontendConfigMock from '../frontend-config-context/use-frontend-config'
import { CustomBranding } from './custom-branding'
import { render } from '@testing-library/react'
import { Mock } from 'ts-mockery'

jest.mock('../frontend-config-context/use-frontend-config')

describe('custom branding', () => {
  const mockFrontendConfigHook = (logo: string | null = null, name: string | null = null) => {
    jest
      .spyOn(UseFrontendConfigMock, 'useFrontendConfig')
      .mockReturnValue(Mock.of<FrontendConfigDto>({ branding: { logo, name } }))
  }

  it("doesn't show anything if no branding is defined", () => {
    mockFrontendConfigHook()
    const view = render(<CustomBranding />)
    expect(view.container).toMatchSnapshot()
  })

  describe.each([false, true, undefined])('with inline=%s', (inline) => {
    it('shows an image if branding logo is defined', () => {
      mockFrontendConfigHook('mockBrandingUrl')
      const view = render(<CustomBranding inline={inline} />)
      expect(view.container).toMatchSnapshot()
    })

    it('shows an text if branding text is defined', () => {
      mockFrontendConfigHook(null, 'mockedBranding')
      const view = render(<CustomBranding inline={inline} />)
      expect(view.container).toMatchSnapshot()
    })

    it('will prefer the logo over the text', () => {
      mockFrontendConfigHook('mockBrandingUrl', 'mockedBranding')
      const view = render(<CustomBranding inline={inline} />)
      expect(view.container).toMatchSnapshot()
    })
  })
})
