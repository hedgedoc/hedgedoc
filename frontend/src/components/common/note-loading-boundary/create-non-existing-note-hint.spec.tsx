/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as createNoteWithPrimaryAliasModule from '../../../api/notes'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import type { NoteDto, NoteMetadataDto } from '@hedgedoc/commons'
import { waitForOtherPromisesToFinish } from '@hedgedoc/commons'
import { act, render, screen, waitFor } from '@testing-library/react'
import { Mock } from 'ts-mockery'

jest.mock('../../../api/notes')
jest.mock('../../../hooks/common/use-single-string-url-parameter')

describe('create non existing note hint', () => {
  const mockedNoteId = 'mockedNoteId'

  const mockCreateNoteWithPrimaryAlias = () => {
    jest
      .spyOn(createNoteWithPrimaryAliasModule, 'createNoteWithPrimaryAlias')
      .mockImplementation(async (markdown, primaryAlias): Promise<NoteDto> => {
        expect(markdown).toBe('')
        expect(primaryAlias).toBe(mockedNoteId)
        const metadata: NoteMetadataDto = Mock.of<NoteMetadataDto>({ primaryAddress: 'mockedPrimaryAlias' })
        await new Promise((resolve) => setTimeout(resolve, 100))
        await waitForOtherPromisesToFinish()
        return Mock.of<NoteDto>({ metadata })
      })
  }

  const mockFailingCreateNoteWithPrimaryAlias = () => {
    jest
      .spyOn(createNoteWithPrimaryAliasModule, 'createNoteWithPrimaryAlias')
      .mockImplementation(async (markdown, primaryAlias): Promise<NoteDto> => {
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

  it('renders nothing if no note id has been provided', async () => {
    const onNoteCreatedCallback = jest.fn()
    const view = render(
      <CreateNonExistingNoteHint noteId={undefined} onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>
    )
    await waitForOtherPromisesToFinish()
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it('renders an button as initial state', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(
      <CreateNonExistingNoteHint
        noteId={mockedNoteId}
        onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>
    )
    await screen.findByTestId('createNoteMessage')
    await waitForOtherPromisesToFinish()
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it('renders a waiting message when button is clicked', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(
      <CreateNonExistingNoteHint
        noteId={mockedNoteId}
        onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>
    )
    const button = await screen.findByTestId('createNoteButton')
    await act<void>(() => {
      button.click()
    })
    await waitFor(async () => {
      expect(await screen.findByTestId('loadingMessage')).toBeInTheDocument()
    })
    await waitForOtherPromisesToFinish()
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it('shows success message when the note has been created', async () => {
    mockCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(
      <CreateNonExistingNoteHint
        noteId={mockedNoteId}
        onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>
    )
    const button = await screen.findByTestId('createNoteButton')
    await act<void>(() => {
      button.click()
    })
    await waitFor(async () => {
      expect(await screen.findByTestId('noteCreated')).toBeInTheDocument()
    })
    await waitForOtherPromisesToFinish()
    expect(onNoteCreatedCallback).toBeCalled()
    expect(view.container).toMatchSnapshot()
  })

  it("shows an error message if note couldn't be created", async () => {
    mockFailingCreateNoteWithPrimaryAlias()
    const onNoteCreatedCallback = jest.fn()
    const view = render(
      <CreateNonExistingNoteHint
        noteId={mockedNoteId}
        onNoteCreated={onNoteCreatedCallback}></CreateNonExistingNoteHint>
    )
    const button = await screen.findByTestId('createNoteButton')
    await act<void>(() => {
      button.click()
    })
    await waitFor(async () => {
      expect(await screen.findByTestId('failedMessage')).toBeInTheDocument()
    })
    await waitForOtherPromisesToFinish()
    expect(onNoteCreatedCallback).not.toBeCalled()
    expect(view.container).toMatchSnapshot()
  })
})
