'use strict'
import { config } from './config'
import { Note, User } from './models'

import fs from 'fs'

import { logger } from './logger'

import { NoteUtils } from './web/note/util'

import { errors } from './errors'

import path from 'path'

import request from 'request'

function showIndex (req, res, _): void {
  const authStatus = req.isAuthenticated()
  const deleteToken = ''

  const data = {
    signin: authStatus,
    infoMessage: req.flash('info'),
    errorMessage: req.flash('error'),
    imprint: fs.existsSync(path.join(config.docsPath, 'imprint.md')),
    privacyStatement: fs.existsSync(path.join(config.docsPath, 'privacy.md')),
    termsOfUse: fs.existsSync(path.join(config.docsPath, 'terms-of-use.md')),
    deleteToken: deleteToken
  }

  if (authStatus) {
    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user: User | null) {
      if (user) {
        data.deleteToken = user.deleteToken
        res.render('index.ejs', data)
      }
    })
  } else {
    res.render('index.ejs', data)
  }
}

function githubActionGist (req, res, note: Note): void {
  const code = req.query.code
  const state = req.query.state
  if (!code || !state) {
    return errors.errorForbidden(res)
  } else {
    // This is the way the github api works, therefore we can't change it to camelcase
    const data = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_id: config.github.clientID,
      // eslint-disable-next-line @typescript-eslint/camelcase
      client_secret: config.github.clientSecret,
      code: code,
      state: state
    }
    const authUrl = 'https://github.com/login/oauth/access_token'
    request({
      url: authUrl,
      method: 'POST',
      json: data
    }, function (error, httpResponse, body) {
      if (!error && httpResponse.statusCode === 200) {
        const accessToken = body.access_token
        if (accessToken) {
          const content = note.content
          const title = Note.decodeTitle(note.title)
          const filename = title.replace('/', ' ') + '.md'
          const gist = {
            files: {}
          }
          gist.files[filename] = {
            content: content
          }
          const gistUrl = 'https://api.github.com/gists'
          request({
            url: gistUrl,
            headers: {
              'User-Agent': 'CodiMD',
              Authorization: 'token ' + accessToken
            },
            method: 'POST',
            json: gist
          }, function (error, httpResponse, body) {
            if (!error && httpResponse.statusCode === 201) {
              res.setHeader('referer', '')
              res.redirect(body.html_url)
            } else {
              errors.errorForbidden(res)
            }
          })
        } else {
          errors.errorForbidden(res)
        }
      } else {
        errors.errorForbidden(res)
      }
    })
  }
}

function githubActions (req, res, _): void {
  const noteId = req.params.noteId
  NoteUtils.findNoteOrCreate(req, res, function (note: Note) {
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

function gitlabActionProjects (req, res, _): void {
  if (req.isAuthenticated()) {
    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (!user) {
        errors.errorNotFound(res)
        return
      }
      class GitlabReturn {
        baseURL;
        version;
        accesstoken;
        profileid;
        projects;
      }
      const ret: GitlabReturn = new GitlabReturn()
      ret.baseURL = config.gitlab.baseURL
      ret.version = config.gitlab.version
      ret.accesstoken = user.accessToken
      ret.profileid = user.profileid
      request(
        config.gitlab.baseURL + '/api/' + config.gitlab.version + '/projects?membership=yes&per_page=100&access_token=' + user.accessToken,
        function (error, httpResponse, body) {
          if (!error && httpResponse.statusCode === 200) {
            ret.projects = JSON.parse(body)
            return res.send(ret)
          } else {
            return res.send(ret)
          }
        }
      )
    }).catch(function (err) {
      logger.error('gitlab action projects failed: ' + err)
      errors.errorInternalError(res)
    })
  } else {
    errors.errorForbidden(res)
  }
}

function gitlabActions (req, res, _): void {
  const noteId = req.params.noteId
  NoteUtils.findNoteOrCreate(req, res, function (note) {
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

export const response = {
  showIndex: showIndex,
  githubActions: githubActions,
  gitlabActions: gitlabActions
}
