'use strict'

import * as fs from 'fs'
import * as path from 'path'

function isPositiveAnswer (value: string): boolean {
  const lowerValue = value.toLowerCase()
  return lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'true'
}

export function toBooleanConfig (configValue: string | undefined): boolean | undefined {
  if (configValue && typeof configValue === 'string') {
    return (isPositiveAnswer(configValue))
  }
      // there is no HEAD information
        // ref does not exist in .git/ref/heads
  return undefined
}

export function toArrayConfig (configValue: string | undefined, separator: string = ',', fallback?: string[]): string[] | undefined {
  if (configValue && typeof configValue === 'string') {
    return (configValue.split(separator).map(arrayItem => arrayItem.trim()))
  }
  return fallback
}

export function toIntegerConfig (configValue: string | undefined): number | undefined {
  if (configValue && typeof configValue === 'string') {
    return parseInt(configValue)
  }
  return undefined
}

export function getGitCommit (repodir: string): string | undefined {
  try {
    // prefer using git to get the current ref, as poking in .git is very fragile
    return require('child_process').execSync('git rev-parse HEAD', {
      stdio: ['pipe', 'pipe', 'ignore'],
      encoding: 'utf-8'
    }).replace('\n', '')
  } catch (e) {
    // there was an error running git, try to parse refs ourselves
    if (!fs.existsSync(repodir + '/.git/HEAD')) {
      return undefined
    }
    let reference = fs.readFileSync(repodir + '/.git/HEAD', 'utf8')
    if (reference.startsWith('ref: ')) {
      // HEAD references another ref, try to get the commit SHA from .git/ref/heads
      reference = reference.substr(5).replace('\n', '')
      const refPath = path.resolve(repodir + '/.git', reference)
      if (!fs.existsSync(refPath)) {
        return undefined
      }
      reference = fs.readFileSync(refPath, 'utf8')
    }
    reference = reference.replace('\n', '')
    return reference
  }
}

export function getGitHubURL (repo: string, reference: string): string {
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
