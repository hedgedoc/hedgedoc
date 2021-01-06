export const toArrayConfig = (configValue: string, separator = ',') => {
  if (!configValue || !configValue.includes(separator)) {
    return []
  }
  return (configValue.split(separator).map(arrayItem => arrayItem.trim()))
}
