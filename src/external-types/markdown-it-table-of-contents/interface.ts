export interface TOCOptions {
  includeLevel: number[]
  containerClass: string
  slugify: (s: string) => string
  markerPattern: RegExp
  listType: 'ul' | 'ol'
  format: (headingAsString: string) => string
  forceFullToc: boolean
  containerHeaderHtml: string
  containerFooterHtml: string
  transformLink: (link: string) => string
}
