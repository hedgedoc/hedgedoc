/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TranslatedInternalLink } from './translated-internal-link'
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
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
