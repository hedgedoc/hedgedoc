import { LineMarkerPosition } from '../../markdown-renderer/markdown-renderer'
export const findLineMarks = (lineMarks: LineMarkerPosition[], lineNumber: number): { lastMarkBefore: LineMarkerPosition | undefined, firstMarkAfter: LineMarkerPosition | undefined } => {
  let lastMarkBefore
  let firstMarkAfter
  for (let i = 0; i < lineMarks.length; i++) {
    const currentMark = lineMarks[i]
    if (!currentMark) {
      continue
    }

    if (currentMark.line <= lineNumber) {
      lastMarkBefore = currentMark
    }
    if (currentMark.line > lineNumber) {
      firstMarkAfter = currentMark
    }
    if (!!firstMarkAfter && !!lastMarkBefore) {
      break
    }
  }
  return {
    lastMarkBefore,
    firstMarkAfter
  }
}
