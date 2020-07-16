import CodeMirror from 'codemirror'

export interface SelectionData {
  ranges: AnchorAndHead[]
}

interface AnchorAndHead {
  anchor: CodeMirror.Position
  head: CodeMirror.Position
}

export interface Positions {
  startPosition: CodeMirror.Position
  endPosition: CodeMirror.Position
}
