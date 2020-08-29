import { DomElement } from 'domhandler'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { CsvTable } from './csv-table'

export class CsvReplacer implements ComponentReplacer {
  getReplacement (codeNode: DomElement, index: number): React.ReactElement | undefined {
    if (codeNode.name !== 'code' || !codeNode.attribs || !codeNode.attribs['data-highlight-language'] || codeNode.attribs['data-highlight-language'] !== 'csv' || !codeNode.children || !codeNode.children[0]) {
      return
    }

    const code = codeNode.children[0].data as string

    const extraData = codeNode.attribs['data-extra']
    const extraRegex = /\s*(delimiter=([^\s]*))?\s*(header)?/
    const extraInfos = extraRegex.exec(extraData)

    let delimiter = ','
    let showHeader = false

    if (extraInfos) {
      delimiter = extraInfos[2] || delimiter
      showHeader = extraInfos[3] !== undefined
    }

    return <CsvTable key={`csv-${index}`} code={code} delimiter={delimiter} showHeader={showHeader}/>
  }
}
