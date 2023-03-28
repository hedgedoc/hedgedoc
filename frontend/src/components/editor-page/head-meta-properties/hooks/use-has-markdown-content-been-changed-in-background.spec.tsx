/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as UseIsDocumentVisibleModule from '../../../../hooks/common/use-is-document-visible'
import * as UseNoteMarkdownContent from '../../../../hooks/common/use-note-markdown-content'
import { useHasMarkdownContentBeenChangedInBackground } from './use-has-markdown-content-been-changed-in-background'
import { render } from '@testing-library/react'
import React, { Fragment } from 'react'

jest.mock('../../../../hooks/common/use-is-document-visible')
jest.mock('../../../../hooks/common/use-note-markdown-content')

describe('use has markdown content been changed in background', () => {
  const TestComponent: React.FC = () => {
    const visible = useHasMarkdownContentBeenChangedInBackground()
    return <Fragment>{String(visible)}</Fragment>
  }

  let documentVisible = true
  let noteContent = 'content'

  beforeEach(() => {
    jest.spyOn(UseIsDocumentVisibleModule, 'useIsDocumentVisible').mockImplementation(() => documentVisible)
    jest.spyOn(UseNoteMarkdownContent, 'useNoteMarkdownContent').mockImplementation(() => noteContent)
  })

  it('returns the correct value', () => {
    documentVisible = true
    noteContent = 'content1'
    const view = render(<TestComponent />)
    expect(view.container.textContent).toBe('false')
    expect(view.container.textContent).toBe('false') //intentionally no change

    noteContent = 'content2'
    view.rerender(<TestComponent />)
    expect(view.container.textContent).toBe('false')

    documentVisible = false
    view.rerender(<TestComponent />)
    expect(view.container.textContent).toBe('false')

    noteContent = 'content3'
    view.rerender(<TestComponent />)
    expect(view.container.textContent).toBe('true')

    noteContent = 'content2'
    view.rerender(<TestComponent />)
    expect(view.container.textContent).toBe('true')

    documentVisible = true
    view.rerender(<TestComponent />)
    expect(view.container.textContent).toBe('false')
  })
})
