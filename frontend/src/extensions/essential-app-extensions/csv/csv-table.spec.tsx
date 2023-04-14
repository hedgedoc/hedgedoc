/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CsvTable } from './csv-table'
import { render } from '@testing-library/react'

describe('CSV Table', () => {
  it('renders correctly with header', () => {
    const view = render(<CsvTable code={'a;b;c\nd;e;f'} delimiter={';'} showHeader={true} />)
    expect(view.container).toMatchSnapshot()
  })

  it('renders correctly without header', () => {
    const view = render(<CsvTable code={'a;b;c\nd;e;f'} delimiter={';'} showHeader={false} />)
    expect(view.container).toMatchSnapshot()
  })

  it('renders correctly without code', () => {
    const view = render(<CsvTable code={''} delimiter={';'} showHeader={false} />)
    expect(view.container).toMatchSnapshot()
  })
})
