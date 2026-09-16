/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMayEdit } from '../../../../hooks/common/use-may-edit'
import { BoldButton } from './buttons/bold-button'
import { CheckListButton } from './buttons/check-list-button'
import { CodeFenceButton } from './buttons/code-fence-button'
import { CollapsibleBlockButton } from './buttons/collapsible-block-button'
import { HeaderLevelButton } from './buttons/header-level-button'
import { HighlightButton } from './buttons/highlight-button'
import { HorizontalLineButton } from './buttons/horizontal-line-button'
import { ImageLinkButton } from './buttons/image-link-button'
import { ItalicButton } from './buttons/italic-button'
import { LinkButton } from './buttons/link-button'
import { OrderedListButton } from './buttons/ordered-list-button'
import { QuotesButton } from './buttons/quotes-button'
import { StrikethroughButton } from './buttons/strikethrough-button'
import { SubscriptButton } from './buttons/subscript-button'
import { SuperscriptButton } from './buttons/superscript-button'
import { UnderlineButton } from './buttons/underline-button'
import { UnorderedListButton } from './buttons/unordered-list-button'
import { TablePickerButton } from './table-picker/table-picker-button'
import styles from './tool-bar.module.scss'
import { ToolbarMenu } from './toolbar-menu'
import { ToolbarSeparator } from './toolbar-separator'
import { UploadImageButton } from './upload-image-button/upload-image-button'
import React, { Fragment, Suspense } from 'react'
import { ButtonToolbar } from 'react-bootstrap'

const EmojiPickerButton = React.lazy(() => import('./emoji-picker/emoji-picker-button'))

/**
 * Renders the toolbar of the editor with buttons for formatting or inserting text.
 */
export const ToolBar: React.FC = () => {
  const mayEdit = useMayEdit()

  if (!mayEdit) {
    return null
  }

  return (
    <ButtonToolbar className={styles.toolbar}>
      <BoldButton />
      <ItalicButton />
      <UnderlineButton />
      <StrikethroughButton />
      <ToolbarMenu>
        <SubscriptButton />
        <SuperscriptButton />
        <HighlightButton />
      </ToolbarMenu>

      <ToolbarSeparator />

      <HeaderLevelButton />
      <UnorderedListButton />
      <OrderedListButton />
      <CheckListButton />
      <ToolbarMenu>
        <CodeFenceButton />
        <QuotesButton />
      </ToolbarMenu>

      <ToolbarSeparator />

      <LinkButton />
      <ImageLinkButton />
      <UploadImageButton />

      <ToolbarSeparator />

      <TablePickerButton />
      <Suspense fallback={<Fragment />}>
        <EmojiPickerButton />
      </Suspense>
      <ToolbarMenu>
        <HorizontalLineButton />
        <CollapsibleBlockButton />
      </ToolbarMenu>
    </ButtonToolbar>
  )
}
