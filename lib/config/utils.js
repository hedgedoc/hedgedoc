'use strict'

const fs = require('fs')
const path = require('path')

exports.toBooleanConfig = function toBooleanConfig (configValue) {
  if (configValue && typeof configValue === 'string') {
    return (configValue === 'true')
  }
  return configValue
}

exports.toArrayConfig = function toArrayConfig (configValue, separator = ',', fallback) {
  if (configValue && typeof configValue === 'string') {
    return (configValue.split(separator).map(arrayItem => arrayItem.trim()))
  }
  return fallback
}

exports.toIntegerConfig = function toIntegerConfig (configValue) {
  if (configValue && typeof configValue === 'string') {
    return parseInt(configValue)
  }
  return configValue
}

exports.getGitCommit = function getGitCommit (repodir) {
  try {
    // prefer using git to get the current ref, as poking in .git is very fragile
    return require('child_process').execSync('git rev-parse HEAD', {
      stdio: ['pipe', 'pipe', 'ignore'],
      encoding: 'utf-8'
    }).replace('\n', '')
  } catch (e) {
    // there was an error running git, try to parse refs ourselves
    if (!fs.existsSync(repodir + '/.git/HEAD')) {
      // there is no HEAD information
      return undefined
    }
    let reference = fs.readFileSync(repodir + '/.git/HEAD', 'utf8')
    if (reference.startsWith('ref: ')) {
      // HEAD references another ref, try to get the commit SHA from .git/ref/heads
      reference = reference.substr(5).replace('\n', '')
      const refPath = path.resolve(repodir + '/.git', reference)
      if (!fs.existsSync(refPath)) {
        // ref does not exist in .git/ref/heads
        return undefined
      }
      reference = fs.readFileSync(refPath, 'utf8')
    }
    reference = reference.replace('\n', '')
    return reference
  }
}

exports.getGitHubURL = function getGitHubURL (repo, reference) {
  // if it's not a github reference, we handle handle that anyway
  if (!repo.startsWith('https://github.com') && !repo.startsWith('git@github.com')) {
    return repo
  }
  if (repo.startsWith('git@github.com') || repo.startsWith('ssh://git@github.com')) {
    repo = repo.replace(/^(ssh:\/\/)?git@github.com:/, 'https://github.com/')
  }

  if (repo.endsWith('.git')) {
    repo = repo.replace(/\.git$/, '/')
  } else if (!repo.endsWith('/')) {
    repo = repo + '/'
  }
  return repo + 'tree/' + reference
}
