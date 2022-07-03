/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as useSingleStringUrlParameterModule from '../../../hooks/common/use-single-string-url-parameter'
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import { render, screen } from '@testing-library/react'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import * as createNoteWithPrimaryAliasModule from '../../../api/notes'
import type { Note, NoteMetadata } from '../../../api/notes/types'
import { Mock } from 'ts-mockery'

describe('create non existing note hint', () => {
  const mockedNoteId = 'mockedNoteId'

  const mockGetNoteIdQueryParameter = () => {
    const expectedQueryParameter = 'noteId'
    jest.spyOn(useSingleStringUrlParameterModule, 'useSingleStringUrlParameter').mockImplementation((parameter) => {
      expect(parameter).toBe(expectedQueryParameter)
      return mockedNoteId
    })
  }

  const mockCreateNoteWithPrimaryAlias = () => {
    jest
      .spyOn(createNoteWithPrimaryAliasModule, 'createNoteWithPrimaryAlias')
      .mockImplementation((markdown, primaryAlias): Promise<Note> => {
        expect(markdown).toBe('')
        expect(primaryAlias).toBe(mockedNoteId)
        const metadata: NoteMetadata = Mock.of<NoteMetadata>({ primaryAddress: 'mockedPrimaryAlias' })
        return Promise.resolve(Mock.of<Note>({ metadata }))
      })
  }

  const mockFailingCreateNoteWithPrimaryAlias = () => {
    jest
      .spyOn(createNoteWithPrimaryAliasModule, 'createNoteWithPrimaryAlias')
      .mockImplementation((markdown, primaryAlias): Promise<Note> => {
        expect(markdown).toBe('')
        expect(primaryAlias).toBe(mockedNoteId)
        return Promise.reject("couldn't create note")
      })
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(async () => {
    await mockI18n()
    mockGetNoteIdQueryParameter()
  })

  it('renders an button as initial state', () => {
    mockCreateNoteWithPrimaryAlias()
    const view = render(<CreateNonExistingNoteHint></CreateNonExistingNoteHint>)
    expect(view.container).toMatchSnapshot()
  })

  it('renders a waiting message when button is clicked', async () => {
    mockCreateNoteWithPrimaryAlias()
    const view = render(<CreateNonExistingNoteHint></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    button.click()
    await screen.findByTestId('loadingMessage')
    expect(view.container).toMatchSnapshot()
  })

  it('redirects when the note has been created', async () => {
    mockCreateNoteWithPrimaryAlias()
    const view = render(<CreateNonExistingNoteHint></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    button.click()
    await screen.findByTestId('redirect')
    expect(view.container).toMatchSnapshot()
  })

  it("shows an error message if note couldn't be created", async () => {
    mockFailingCreateNoteWithPrimaryAlias()
    const view = render(<CreateNonExistingNoteHint></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    button.click()
    await screen.findByTestId('failedMessage')
    expect(view.container).toMatchSnapshot()
  })
})
