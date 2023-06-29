/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CategoryCard } from './category-card'
import { ShortcutLine } from './shortcut-line'
import React from 'react'
import { Container } from 'react-bootstrap'

/**
 * Renders a list of shortcuts usable in HedgeDoc.
 */
export const ShortcutsContent: React.FC = () => {
  return (
    <Container>
      <CategoryCard headerI18nKey={'shortcuts.viewMode.header'}>
        <ShortcutLine
          functionNameI18nKey={'shortcuts.viewMode.view'}
          showModifierKey={true}
          showAltKey={true}
          functionKeyCode={'v'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.viewMode.both'}
          showModifierKey={true}
          showAltKey={true}
          functionKeyCode={'b'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.viewMode.edit'}
          showModifierKey={true}
          showAltKey={true}
          functionKeyCode={'e'}
        />
      </CategoryCard>

      <CategoryCard headerI18nKey={'shortcuts.editor.header'}>
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.bold'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'b'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.italic'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'i'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.underline'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'u'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.strikethrough'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'d'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.mark'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'m'}
        />
        <ShortcutLine
          functionNameI18nKey={'shortcuts.editor.link'}
          showModifierKey={true}
          showAltKey={false}
          functionKeyCode={'k'}
        />
      </CategoryCard>
    </Container>
  )
}
