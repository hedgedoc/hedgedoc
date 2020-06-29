export interface TocOptions {
    placeholder: string
    slugify: (s: string) => string
    containerClass: string
    containerId: string
    listClass: string
    itemClass: string
    linkClass: string
    level: number | number[]
    listType: 'ol' | 'ul'
    format: (s: string) => string
    callback: (tocCode: string, ast: TocAst) => void
}

export interface TocAst {
    l: number
    n: string
    c: TocAst[]
}
