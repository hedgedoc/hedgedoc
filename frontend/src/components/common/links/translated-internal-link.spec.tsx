/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { TranslatedInternalLink } from './translated-internal-link'
import { render } from '@testing-library/react'

describe('TranslatedInternalLink', () => {
  const href = '/test'
  beforeAll(async () => {
    await mockI18n()
  })
  it('renders with i18nKey', () => {
    const view = render(<TranslatedInternalLink i18nKey={'testi18nKey'} href={href} />)
    expect(view.container).toMatchSnapshot()
  })
})
