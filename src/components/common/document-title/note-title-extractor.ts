import { YAMLMetaData } from '../../editor/yaml-metadata/yaml-metadata'

export const extractNoteTitle = (defaultTitle: string, noteMetadata?: YAMLMetaData, firstHeading?: string): string => {
  if (noteMetadata?.title && noteMetadata?.title !== '') {
    return noteMetadata.title
  } else if (noteMetadata?.opengraph && noteMetadata?.opengraph.get('title') && noteMetadata?.opengraph.get('title') !== '') {
    return (noteMetadata?.opengraph.get('title') ?? defaultTitle)
  } else {
    return (firstHeading ?? defaultTitle).trim()
  }
}
