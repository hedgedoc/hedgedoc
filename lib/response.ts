'use strict'
// response
// external modules
import type { Request, Response, NextFunction } from 'express'
import * as fs from 'fs'
import * as path from 'path'
// core
import config = require('./config')
import logger = require('./logger')
import models = require('./models')
import * as noteUtil from './web/note/util'
import * as errors from './errors'

function showIndex (req: Request, res: Response, _next: NextFunction): void {
  const authStatus: boolean = req.isAuthenticated()
  const deleteToken = ''

  const data: Record<string, unknown> = {
    signin: authStatus,
    infoMessage: (req as any).flash('info'),
    errorMessage: (req as any).flash('error'),
    imprint: fs.existsSync(path.join(config.docsPath, 'imprint.md')),
    privacyStatement: fs.existsSync(path.join(config.docsPath, 'privacy.md')),
    termsOfUse: fs.existsSync(path.join(config.docsPath, 'terms-of-use.md')),
    deleteToken
  }

  if (authStatus) {
    models.User.findOne({
      where: {
        id: (req as any).user.id
      }
    }).then(function (user: any) {
      if (user) {
        data.deleteToken = user.deleteToken
        res.render('index.ejs', data)
      }
    })
  } else {
    res.render('index.ejs', data)
  }
}

function githubActionGist (req: Request, res: Response, note: Record<string, unknown>): void {
  const code = req.query.code
  const state = req.query.state
  if (!code || !state) {
    return errors.errorForbidden(res)
  } else {
    const data = {
      client_id: config.github.clientID,
      client_secret: config.github.clientSecret,
      code,
      state
    }
    const authUrl = 'https://github.com/login/oauth/access_token'
    fetch(authUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }).then(resp => {
      if (!resp.ok) {
        throw new Error('forbidden')
      }
      return resp.json()
    }).then(body => {
      const accessToken = body.access_token
      if (!accessToken) {
        throw new Error('forbidden')
      }
      const content = note.content as string
      const title = models.Note.decodeTitle(note.title)
      const filename = title.replace('/', ' ') + '.md'
      const gist: { files: Record<string, { content: string }> } = {
        files: {}
      }
      gist.files[filename] = {
        content
      }
      const gistUrl = 'https://api.github.com/gists'
      return fetch(gistUrl, {
        method: 'POST',
        body: JSON.stringify(gist),
        headers: {
          'User-Agent': 'HedgeDoc',
          Authorization: 'token ' + accessToken,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
    }).then(resp => {
      if (resp.status !== 201) {
        throw new Error('forbidden')
      }
      return resp.json()
    }).then(body => {
      res.setHeader('referer', '')
      res.redirect(body.html_url)
    }).catch(error => {
      if (error.message === 'forbidden') {
        return errors.errorForbidden(res)
      }
      logger.error('GitHub Gist auth failed: ' + error)
      return errors.errorInternalError(res)
    })
  }
}

function githubActions (req: Request, res: Response, next: NextFunction): void {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note: any) {
    const action = req.params.action
    switch (action) {
      case 'gist':
        githubActionGist(req, res, note)
        break
      default:
        res.redirect(config.serverURL + '/' + noteId)
        break
    }
  })
}

function gitlabActionProjects (req: Request, res: Response, _note: Record<string, unknown>): void {
  if (req.isAuthenticated()) {
    models.User.findOne({
      where: {
        id: (req as any).user.id
      }
    }).then(function (user: any) {
      if (!user) {
        return errors.errorNotFound(res)
      }
      const ret: Record<string, unknown> = {
        baseURL: config.gitlab.baseURL,
        version: config.gitlab.version,
        accesstoken: user.accessToken,
        profileid: user.profileid,
        projects: []
      }
      const apiUrl = `${config.gitlab.baseURL}/api/${config.gitlab.version}/projects?membership=yes&per_page=100&access_token=${user.accessToken}`
      fetch(apiUrl).then(resp => {
        if (!resp.ok) {
          res.send(ret)
          return Promise.reject(new Error('HTTP request returned not okay-ish status'))
        }
        return resp.json()
      }).then(body => {
        ret.projects = body
        return res.send(ret)
      }).catch(err => {
        logger.error('gitlab action projects failed: ', err)
      })
    }).catch(function (err: Error) {
      logger.error('gitlab action projects failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
}

function gitlabActions (req: Request, res: Response, next: NextFunction): void {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note: any) {
    const action = req.params.action
    switch (action) {
      case 'projects':
        gitlabActionProjects(req, res, note)
        break
      default:
        res.redirect(config.serverURL + '/' + noteId)
        break
    }
  })
}

// public
const response = {
  showIndex,
  githubActions,
  gitlabActions
}

export = response
