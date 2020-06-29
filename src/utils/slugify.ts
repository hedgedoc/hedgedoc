export const slugify = (url:string) => {
  return encodeURIComponent(String(url).trim().toLowerCase().replace(/\s+/g, '-'))
}
