'use strict'
// response
// external modules
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
// core
const config = require('./config')
const logger = require('./logger')
const models = require('./models')
const noteUtil = require('./web/note/util')
const errors = require('./errors')

// public
const response = {
  showIndex: showIndex,
  githubActions: githubActions,
  gitlabActions: gitlabActions
}

function showIndex (req, res, next) {
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
    models.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (user) {
        data.deleteToken = user.deleteToken
        res.render('index.ejs', data)
      }
    })
  } else {
    res.render('index.ejs', data)
  }
}

function githubActions (req, res, next) {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
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

function githubActionGist (req, res, note) {
  const code = req.query.code
  const state = req.query.state
  if (!code || !state) {
    return errors.errorForbidden(res)
  } else {
    const data = {
      client_id: config.github.clientID,
      client_secret: config.github.clientSecret,
      code: code,
      state: state
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
      const content = note.content
      const title = models.Note.decodeTitle(note.title)
      const filename = title.replace('/', ' ') + '.md'
      const gist = {
        files: {}
      }
      gist.files[filename] = {
        content: content
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

function gitlabActions (req, res, next) {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
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

function gitlabActionProjects (req, res, note) {
  if (req.isAuthenticated()) {
    models.User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (!user) {
        return errors.errorNotFound(res)
      }
      const ret = {
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
    }).catch(function (err) {
      logger.error('gitlab action projects failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
}

module.exports = response
