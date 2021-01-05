export const toArrayConfig = (configValue: string, separator = ',') => {
    return (configValue.split(separator).map(arrayItem => arrayItem.trim()))
}