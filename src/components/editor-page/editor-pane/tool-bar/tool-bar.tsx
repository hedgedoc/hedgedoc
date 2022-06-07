/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, Suspense } from 'react'
import { ButtonGroup, ButtonToolbar } from 'react-bootstrap'
import { TablePickerButton } from './table-picker/table-picker-button'
import styles from './tool-bar.module.scss'
import { UploadImageButton } from './upload-image-button/upload-image-button'
import { BoldButton } from './buttons/bold-button'
import { ItalicButton } from './buttons/italic-button'
import { UnderlineButton } from './buttons/underline-button'
import { StrikethroughButton } from './buttons/strikethrough-button'
import { SubscriptButton } from './buttons/subscript-button'
import { SuperscriptButton } from './buttons/superscript-button'
import { HighlightButton } from './buttons/highlight-button'
import { HeaderLevelButton } from './buttons/header-level-button'
import { CodeFenceButton } from './buttons/code-fence-button'
import { QuotesButton } from './buttons/quotes-button'
import { UnorderedListButton } from './buttons/unordered-list-button'
import { OrderedListButton } from './buttons/ordered-list-button'
import { CheckListButton } from './buttons/check-list-button'
import { LinkButton } from './buttons/link-button'
import { ImageLinkButton } from './buttons/image-link-button'
import { HorizontalLineButton } from './buttons/horizontal-line-button'
import { CollapsibleBlockButton } from './buttons/collapsible-block-button'
import { CommentButton } from './buttons/comment-button'

const EmojiPickerButton = React.lazy(() => import('./emoji-picker/emoji-picker-button'))

export const ToolBar: React.FC = () => {
  return (
    <ButtonToolbar className={`bg-light ${styles.toolbar}`}>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <BoldButton />
        <ItalicButton />
        <UnderlineButton />
        <StrikethroughButton />
        <SubscriptButton />
        <SuperscriptButton />
        <HighlightButton />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <HeaderLevelButton />
        <CodeFenceButton />
        <QuotesButton />
        <UnorderedListButton />
        <OrderedListButton />
        <CheckListButton />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <LinkButton />
        <ImageLinkButton />
        <UploadImageButton />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <TablePickerButton />
        <HorizontalLineButton />
        <CollapsibleBlockButton />
        <CommentButton />
        <Suspense fallback={<Fragment />}>
          <EmojiPickerButton />
        </Suspense>
      </ButtonGroup>
    </ButtonToolbar>
  )
}
