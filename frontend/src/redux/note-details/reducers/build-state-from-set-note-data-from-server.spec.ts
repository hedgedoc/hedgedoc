/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as buildStateFromUpdatedMarkdownContentModule from '../build-state-from-updated-markdown-content'
import type { NoteDetails } from '../types'
import { buildStateFromServerDto } from './build-state-from-set-note-data-from-server'
import { NoteTextDirection, NoteType } from '@hedgedoc/commons'
import { DateTime } from 'luxon'
import { Mock } from 'ts-mockery'
import type { NoteDto } from '@hedgedoc/commons'

jest.mock('../build-state-from-updated-markdown-content')

describe('build state from set note data from server', () => {
  const buildStateFromUpdatedMarkdownContentMock = jest.spyOn(
    buildStateFromUpdatedMarkdownContentModule,
    'buildStateFromUpdatedMarkdownContent'
  )
  const mockedNoteDetails = Mock.of<NoteDetails>()

  beforeAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockImplementation(() => mockedNoteDetails)
  })

  afterAll(() => {
    buildStateFromUpdatedMarkdownContentMock.mockReset()
  })

  it('builds a new state from the given note dto', () => {
    const noteDto: NoteDto = {
      content: 'line1\nline2',
      metadata: {
        primaryAddress: 'alias',
        version: 5678,
        aliases: [
          {
            noteId: 'id',
            primaryAlias: true,
            name: 'alias'
          }
        ],
        id: 'id',
        createdAt: '2012-05-25T09:08:34.123',
        description: 'description',
        editedBy: ['editedBy'],
        permissions: {
          owner: 'username',
          sharedToGroups: [
            {
              canEdit: true,
              groupName: 'groupName'
            }
          ],
          sharedToUsers: [
            {
              canEdit: true,
              username: 'shareusername'
            }
          ]
        },
        viewCount: 987,
        tags: ['tag'],
        title: 'title',
        updatedAt: '2020-05-25T09:08:34.123',
        updateUsername: 'updateusername'
      },
      editedByAtPosition: [
        {
          endPosition: 5,
          createdAt: 'createdAt',
          startPosition: 9,
          updatedAt: 'updatedAt',
          username: 'userName'
        }
      ]
    }

    const convertedNoteDetails: NoteDetails = {
      frontmatter: {
        title: '',
        description: '',
        tags: [],
        robots: '',
        lang: 'en',
        license: '',
        dir: NoteTextDirection.LTR,
        newlinesAreBreaks: true,
        type: NoteType.DOCUMENT,
        opengraph: {},
        slideOptions: {
          transition: 'zoom',
          autoSlide: 0,
          autoSlideStoppable: true,
          backgroundTransition: 'fade',
          slideNumber: false
        }
      },
      startOfContentLineOffset: 0,
      title: 'title',
      selection: { from: 0 },
      markdownContent: {
        plain: 'line1\nline2',
        lines: ['line1', 'line2'],
        lineStartIndexes: [0, 6]
      },
      firstHeading: '',
      rawFrontmatter: '',
      id: 'id',
      createdAt: DateTime.fromISO('2012-05-25T09:08:34.123').toSeconds(),
      updatedAt: DateTime.fromISO('2020-05-25T09:08:34.123').toSeconds(),
      updateUsername: 'updateusername',
      viewCount: 987,
      aliases: [
        {
          name: 'alias',
          noteId: 'id',
          primaryAlias: true
        }
      ],
      primaryAddress: 'alias',
      version: 5678,
      editedBy: ['editedBy'],
      permissions: {
        owner: 'username',
        sharedToGroups: [
          {
            canEdit: true,
            groupName: 'groupName'
          }
        ],
        sharedToUsers: [
          {
            canEdit: true,
            username: 'shareusername'
          }
        ]
      }
    }

    const result = buildStateFromServerDto(noteDto)
    expect(result).toEqual(mockedNoteDetails)
    expect(buildStateFromUpdatedMarkdownContentMock).toHaveBeenCalledWith(convertedNoteDetails, 'line1\nline2')
  })
})
