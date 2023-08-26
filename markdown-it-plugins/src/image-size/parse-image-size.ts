/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

import { SpecialCharacters } from './specialCharacters.js'

export interface ParseImageSize {
  position: number
  width: string
  height: string
}

export interface ParseNextNumber {
  position: number
  value: string
}

function isCharacterADigit(code: number) {
  return code >= SpecialCharacters.NUMBER_ZERO && code <= SpecialCharacters.NUMBER_NINE
}

function findNextNotNumberCharacter(startPosition: number, maximalPosition: number, content: string): number {
  for (let position = startPosition; position < maximalPosition; position += 1) {
    const code = content.charCodeAt(position)
    if (!isCharacterADigit(code) && code !== SpecialCharacters.PERCENTAGE) {
      return position
    }
  }

  return maximalPosition
}

function parseNextNumber(content: string, startPosition: number, maximalPosition: number): ParseNextNumber {
  const endCharacterIndex = findNextNotNumberCharacter(startPosition, maximalPosition, content)

  return {
    position: endCharacterIndex,
    value: content.slice(startPosition, endCharacterIndex)
  }
}

/*
 size must follow = without any white spaces as follows
 (1) =300x200
 (2) =300x
 (3) =x200
*/
const checkImageSizeStart = (code: number): boolean => {
  return (
    code === SpecialCharacters.LOWER_CASE_X ||
    (code >= SpecialCharacters.NUMBER_ZERO && code <= SpecialCharacters.NUMBER_NINE)
  )
}

export function parseImageSize(
  imageSize: string,
  startCharacterPosition: number,
  maximalCharacterPosition: number
): ParseImageSize | undefined {
  if (startCharacterPosition >= maximalCharacterPosition) {
    return
  }

  let currentCharacterPosition = startCharacterPosition

  if (imageSize.charCodeAt(currentCharacterPosition) !== SpecialCharacters.EQUALS /* = */) {
    return
  }

  currentCharacterPosition += 1

  if (!checkImageSizeStart(imageSize.charCodeAt(currentCharacterPosition))) {
    return
  }

  // parse width
  const width = parseNextNumber(imageSize, currentCharacterPosition, maximalCharacterPosition)
  currentCharacterPosition = width.position

  // next charactor must be 'x'
  const code = imageSize.charCodeAt(currentCharacterPosition)
  if (code !== SpecialCharacters.LOWER_CASE_X /* x */) {
    return
  }
  currentCharacterPosition += 1

  // parse height
  const height = parseNextNumber(imageSize, currentCharacterPosition, maximalCharacterPosition)
  currentCharacterPosition = height.position

  return {
    width: width.value,
    height: height.value,
    position: currentCharacterPosition
  }
}
