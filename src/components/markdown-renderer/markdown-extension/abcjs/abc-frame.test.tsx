/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AbcFrame } from './abc-frame'
import { mockI18n } from '../../test-utils/mock-i18n'

describe('AbcFrame', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })
  beforeEach(async () => {
    await mockI18n()
  })

  it('renders a music sheet', async () => {
    const element = (
      <AbcFrame
        code={
          'X:1\nT:Speed the Plough\nM:4/4\nC:Trad.\nK:G\n|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|\nGABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|\n|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|\ng2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|'
        }
      />
    )
    const view = render(element)
    expect(view.container).toMatchSnapshot()
    expect(await screen.findByText('Sheet Music for "Speed the Plough"')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })

  it("renders an error if abcjs file can't be loaded", async () => {
    jest.mock('abcjs', () => {
      throw new Error('abc is exploded!')
    })
    const element = (
      <AbcFrame
        code={
          'X:1\nT:Speed the Plough\nM:4/4\nC:Trad.\nK:G\n|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|\nGABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|\n|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|\ng2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|'
        }
      />
    )
    const view = render(element)
    expect(view.container).toMatchSnapshot()
    expect(await screen.findByText('common.errorWhileLoading')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })

  it('renders an error if abcjs render function crashes', async () => {
    jest.mock('abcjs', () => ({
      renderAbc: () => {
        throw new Error('abc is exploded!')
      }
    }))
    const element = (
      <AbcFrame
        code={
          'X:1\nT:Speed the Plough\nM:4/4\nC:Trad.\nK:G\n|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|\nGABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|\n|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|\ng2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|'
        }
      />
    )
    const view = render(element)
    expect(view.container).toMatchSnapshot()
    expect(await screen.findByText('editor.embeddings.abcJs.errorWhileRendering')).toBeInTheDocument()
    expect(view.container).toMatchSnapshot()
  })
})
