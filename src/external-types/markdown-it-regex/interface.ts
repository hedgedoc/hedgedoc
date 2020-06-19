export interface RegexOptions {
  name: string,
  regex: RegExp,
  replace: (match: string) => string
}
