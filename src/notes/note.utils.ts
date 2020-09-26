import { safeLoad } from 'js-yaml'

export class NoteUtils {
  public static parseTitle(content: string): string {
    const metadata = NoteUtils.parseMetadata(content);
    if (metadata['title']) {
      return metadata['title']
    }

    if (metadata['opengraph'] && metadata['opengraph']['title']) {
      return metadata['opengraph']['title']
    }

    try {
      const firstHeading = content.indexOf('# ')
      const endOfHeading = content.indexOf('\n', firstHeading)
      return content.substr(firstHeading, endOfHeading - firstHeading).substr(2)
    } catch (err) {
      return ''
    }
  }

  public static parseDescription(content: string): string {
    const metadata = NoteUtils.parseMetadata(content);
    if (metadata['description']) {
      return metadata['description']
    }

    if (metadata['opengraph'] && metadata['opengraph']['description']) {
      return metadata['opengraph']['description']
    }

    return ''
  }

  public static parseTags(content: string): string[] {
    const metadata = NoteUtils.parseMetadata(content);

    if (metadata['tags']) {
      return metadata['tags'].split(',').map(entry => entry.trim()) ?? []
    }

    return []
  }

  private static parseMetadata(content: string) {
    const matches = content.match(/^---\n((?:.|\n)*)\n---.*/)
    if (!matches || matches.length <= 1) {
      return ''
    }
    return safeLoad(matches[1])
  }
}
