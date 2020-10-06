export const download = (data: BlobPart, fileName: string, mimeType: string): void => {
  const file = new Blob([data], { type: mimeType })
  const helperElement = document.createElement('a')
  helperElement.href = URL.createObjectURL(file)
  helperElement.download = fileName
  document.body.appendChild(helperElement)
  helperElement.click()
  setTimeout(() => helperElement.remove(), 2000)
}
