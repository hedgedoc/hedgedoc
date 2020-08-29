export const parseCsv = (csvText: string, csvColumnDelimiter: string): string[][] => {
  const rows = csvText.split('\n')
  if (!rows || rows.length === 0) {
    return []
  }
  const splitRegex = new RegExp(`${csvColumnDelimiter}(?=(?:[^"]*"[^"]*")*[^"]*$)`)
  return rows.filter(row => row !== '').map(row => row.split(splitRegex))
}
