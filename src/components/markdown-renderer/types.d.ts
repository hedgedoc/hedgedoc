export interface LineKeys {
  line: string,
  id: number
}

export interface LineMarkerPosition {
  line: number
  position: number
}

export interface AdditionalMarkdownRendererProps {
  className?: string,
  content: string,
  wide?: boolean,
}
