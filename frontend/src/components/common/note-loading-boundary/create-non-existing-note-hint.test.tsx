/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as useSingleStringUrlParameterModule from '../../../hooks/common/use-single-string-url-parameter'
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import { act, render, screen } from '@testing-library/react'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import * as createNoteWithPrimaryAliasModule from '../../../api/notes'
import type { Note, NoteMetadata } from '../../../api/notes/types'
import { Mock } from 'ts-mockery'
import { waitForOtherPromisesToFinish } from '../../../utils/wait-for-other-promises-to-finish'

jest.mock('../../../api/notes')
jest.mock('../../../hooks/common/use-single-string-url-parameter')

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
      .mockImplementation(async (markdown, primaryAlias): Promise<Note> => {
        expect(markdown).toBe('')
        expect(primaryAlias).toBe(mockedNoteId)
        const metadata: NoteMetadata = Mock.of<NoteMetadata>({ primaryAddress: 'mockedPrimaryAlias' })
        await waitForOtherPromisesToFinish()
        return Mock.of<Note>({ metadata })
      })
  }

  const mockFailingCreateNoteWithPrimaryAlias = () => {
    jest
      .spyOn(createNoteWithPrimaryAliasModule, 'createNoteWithPrimaryAlias')
      .mockImplementation(async (markdown, primaryAlias): Promise<Note> => {
        expect(markdown).toBe('')
        expect(primaryAlias).toBe(mockedNoteId)
        await waitForOtherPromisesToFinish()
        throw new Error("couldn't create note")
      })
  }

  beforeAll(async () => {
    await mockI18n()
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(() => {
    mockGetNoteIdQueryParameter()
  })

  it('renders an button as initial state', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(<CreateNonExistingNoteHint onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>)
    await screen.findByTestId('createNoteMessage')
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it('renders a waiting message when button is clicked', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(<CreateNonExistingNoteHint onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    await act(() => {
      button.click()
    })
    await screen.findByTestId('loadingMessage')
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it('shows success message when the note has been created', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(<CreateNonExistingNoteHint onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    await act(() => {
      button.click()
    })
    await screen.findByTestId('noteCreated')
    expect(onNoteCreatedCallback).toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it("shows an error message if note couldn't be created", async () => {
    mockFailingCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(<CreateNonExistingNoteHint onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>)
    const button = await screen.findByTestId('createNoteButton')
    await act(() => {
      button.click()
    })
    await screen.findByTestId('failedMessage')
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })
})
