/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { useMemo } from 'react'
import { Table } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { BasicMarkdownRenderer } from '../../../markdown-renderer/basic-markdown-renderer'
import { BasicMarkdownItConfigurator } from '../../../markdown-renderer/markdown-it-configurator/BasicMarkdownItConfigurator'
import { HighlightedCode } from '../../../markdown-renderer/replace-components/highlighted-fence/highlighted-code/highlighted-code'
import './cheatsheet.scss'

export const Cheatsheet: React.FC = () => {
  const { t } = useTranslation()
  const codes = [
    `**${t('editor.editorToolbar.bold')}**`,
    `*${t('editor.editorToolbar.italic')}*`,
    `++${t('editor.editorToolbar.underline')}++`,
    `~~${t('editor.editorToolbar.strikethrough')}~~`,
    'H~2~O',
    '19^th^',
    `==${t('editor.help.cheatsheet.highlightedText')}==`,
    `# ${t('editor.editorToolbar.header')}`,
    `\`${t('editor.editorToolbar.code')}\``,
    '```javascript=\nvar x = 5;\n```',
    `> ${t('editor.editorToolbar.blockquote')}`,
    `- ${t('editor.editorToolbar.unorderedList')}`,
    `1. ${t('editor.editorToolbar.orderedList')}`,
    `- [ ] ${t('editor.editorToolbar.checkList')}`,
    `[${t('editor.editorToolbar.link')}](https://example.com)`,
    `![${t('editor.editorToolbar.image')}](/icons/mstile-70x70.png)`,
    ':smile:',
    `:::info\n${t('editor.help.cheatsheet.exampleAlert')}\n:::`
  ]

  const markdownIt = useMemo(() => {
    return new BasicMarkdownItConfigurator()
      .buildConfiguredMarkdownIt()
  }, [])

  return (
    <Table className="table-condensed table-cheatsheet">
      <thead>
        <tr>
          <th><Trans i18nKey='editor.help.cheatsheet.example'/></th>
          <th><Trans i18nKey='editor.help.cheatsheet.syntax'/></th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code, key) => {
          return (
            <tr key={key}>
              <td>
                <BasicMarkdownRenderer
                  content={code}
                  wide={false}
                  markdownIt={markdownIt}
                />
              </td>
              <td className={'markdown-body'}>
                <HighlightedCode code={code} wrapLines={true} startLineNumber={1} language={'markdown'}/>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
