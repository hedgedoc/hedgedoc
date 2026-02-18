'use strict'
// external modules
import DiffMatchPatch = require('diff-match-patch')
const dmp = new DiffMatchPatch()

// core
import logger = require('../logger')

interface DmpWorkerMessage {
  msg: string
  cacheKey: string
  lastDoc?: string
  currDoc?: string
  revisions?: any[]
  count?: number
}

process.on('message', function (raw: DmpWorkerMessage) {
  const data = raw
  if (!data || !data.msg || !data.cacheKey) {
    return logger.error('dmp worker error: not enough data')
  }
  switch (data.msg) {
    case 'create patch':
      if (
        !Object.prototype.hasOwnProperty.call(data, 'lastDoc') ||
        !Object.prototype.hasOwnProperty.call(data, 'currDoc')
      ) {
        return logger.error(
          'dmp worker error: not enough data on create patch'
        )
      }
      try {
        const patch = createPatch(data.lastDoc!, data.currDoc!)
        process.send!({
          msg: 'check',
          result: patch,
          cacheKey: data.cacheKey
        })
      } catch (err) {
        logger.error('dmp worker error', err)
        process.send!({
          msg: 'error',
          error: err,
          cacheKey: data.cacheKey
        })
      }
      break
    case 'get revision':
      if (
        !Object.prototype.hasOwnProperty.call(data, 'revisions') ||
        !Object.prototype.hasOwnProperty.call(data, 'count')
      ) {
        return logger.error(
          'dmp worker error: not enough data on get revision'
        )
      }
      try {
        const result = getRevision(data.revisions!, data.count!)
        process.send!({
          msg: 'check',
          result,
          cacheKey: data.cacheKey
        })
      } catch (err) {
        logger.error('dmp worker error', err)
        process.send!({
          msg: 'error',
          error: err,
          cacheKey: data.cacheKey
        })
      }
      break
  }
})

function createPatch (lastDoc: string, currDoc: string): string {
  const msStart = new Date().getTime()
  const diff = dmp.diff_main(lastDoc, currDoc)
  const patch = dmp.patch_toText(dmp.patch_make(lastDoc, diff))
  const msEnd = new Date().getTime()
  logger.debug(patch)
  logger.debug(msEnd - msStart + 'ms')
  return patch
}

interface RevisionEntry {
  content?: string
  lastContent?: string
  patch?: string
  authorship?: unknown[]
}

interface RevisionResult {
  content: string
  patch: any[]
  authorship: unknown[]
}

function getRevision (revisions: RevisionEntry[], count: number): RevisionResult {
  const msStart = new Date().getTime()
  let startContent: string | null = null
  let lastPatch = ''
  let applyPatches: any[] = []
  let authorship: unknown[] = []
  if (count <= Math.round(revisions.length / 2)) {
    // start from top to target
    for (let i = 0; i < count; i++) {
      const revision = revisions[i]
      if (i === 0) {
        startContent = revision.content || revision.lastContent || null
      }
      if (i !== count - 1) {
        const patch = dmp.patch_fromText(revision.patch!)
        applyPatches = applyPatches.concat(patch)
      }
      lastPatch = revision.patch || ''
      authorship = revision.authorship || []
    }
    // swap DIFF_INSERT and DIFF_DELETE to achieve unpatching
    for (let i = 0, l = applyPatches.length; i < l; i++) {
      for (let j = 0, m = applyPatches[i].diffs.length; j < m; j++) {
        const diff = applyPatches[i].diffs[j]
        if (diff[0] === DiffMatchPatch.DIFF_INSERT) {
          diff[0] = DiffMatchPatch.DIFF_DELETE
        } else if (diff[0] === DiffMatchPatch.DIFF_DELETE) {
          diff[0] = DiffMatchPatch.DIFF_INSERT
        }
      }
    }
  } else {
    // start from bottom to target
    const l = revisions.length - 1
    for (let i = l; i >= count - 1; i--) {
      const revision = revisions[i]
      if (i === l) {
        startContent = revision.lastContent || null
        authorship = revision.authorship || []
      }
      if (revision.patch) {
        const patch = dmp.patch_fromText(revision.patch)
        applyPatches = applyPatches.concat(patch)
      }
      lastPatch = revision.patch || ''
      authorship = revision.authorship || []
    }
  }
  try {
    const finalContent = dmp.patch_apply(applyPatches, startContent as string)[0]
    const data = {
      content: finalContent,
      patch: dmp.patch_fromText(lastPatch),
      authorship
    }
    const msEnd = new Date().getTime()
    logger.debug(msEnd - msStart + 'ms')
    return data
  } catch (err) {
    throw new Error(err as string)
  }
}

// log uncaught exception
process.on('uncaughtException', function (err: Error) {
  logger.error('An uncaught exception has occured.')
  logger.error(err)
  logger.error('Process will exit now.')
  process.exit(1)
})
