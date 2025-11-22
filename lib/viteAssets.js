'use strict'

const fs = require('fs')
const path = require('path')

let cachedManifest = null

function loadManifest (rootDir) {
  if (cachedManifest) {
    return cachedManifest
  }
  const manifestPath = path.join(rootDir, 'public/build/.vite/manifest.json')
  if (!fs.existsSync(manifestPath)) {
    return null
  }
  cachedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  return cachedManifest
}

function getEntry (entryName, rootDir) {
  const manifest = loadManifest(rootDir)
  if (!manifest) {
    return null
  }
  return manifest[entryName] || null
}

function buildTagsForEntry (entryName, rootDir) {
  const entry = getEntry(entryName, rootDir)
  if (!entry) return ''

  const tags = []

  if (Array.isArray(entry.css)) {
    for (const css of entry.css) {
      tags.push(`<link href="/build/${css.split('/').pop()}" rel="stylesheet">`)
    }
  }

  if (entry.file) {
    tags.push(`<script type="module" src="/build/${entry.file.split('/').pop()}"></script>`)
  }

  return tags.join('\n')
}

function buildTags (entryNames, rootDir) {
  if (!Array.isArray(entryNames)) {
    entryNames = [entryNames]
  }
  return entryNames.map(name => buildTagsForEntry(name, rootDir)).join('\n')
}

module.exports = {
  buildTags
}
