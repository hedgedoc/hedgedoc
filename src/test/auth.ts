import assert from 'assert'
import { ImportMock } from 'ts-mock-imports'
import * as configModule from '../lib/config'
import { DropboxMiddleware } from '../lib/web/auth/dropbox'
import { EmailMiddleware } from '../lib/web/auth/email'
import { FacebookMiddleware } from '../lib/web/auth/facebook'
import { GithubMiddleware } from '../lib/web/auth/github'
import { GitlabMiddleware } from '../lib/web/auth/gitlab'
import { GoogleMiddleware } from '../lib/web/auth/google'
import { LdapMiddleware } from '../lib/web/auth/ldap'
import { OAuth2Middleware } from '../lib/web/auth/oauth2'
import { OPenIDMiddleware } from '../lib/web/auth/openid'
import { TwitterMiddleware } from '../lib/web/auth/twitter'

describe('AuthMiddlewares', function () {
  // We currently exclude the SAML Auth, because it needs a certificate file
  const middlewareList = [{
    name: 'Facebook',
    middleware: FacebookMiddleware,
    config: {
      facebook: {
        clientID: 'foobar',
        clientSecret: 'foobar'
      }
    }
  }, {
    name: 'Twitter',
    middleware: TwitterMiddleware,
    config: {
      twitter: {
        consumerKey: 'foobar',
        consumerSecret: 'foobar'
      }
    }
  }, {
    name: 'GitHub',
    middleware: GithubMiddleware,
    config: {
      github: {
        clientID: 'foobar',
        clientSecret: 'foobar'
      }
    }
  }, {
    name: 'Gitlab',
    middleware: GitlabMiddleware,
    config: {
      gitlab: {
        clientID: 'foobar',
        clientSecret: 'foobar'
      }
    }
  }, {
    name: 'Dropbox',
    middleware: DropboxMiddleware,
    config: {
      dropbox: {
        clientID: 'foobar',
        clientSecret: 'foobar'
      }
    }
  }, {
    name: 'Google',
    middleware: GoogleMiddleware,
    config: {
      google: {
        clientID: 'foobar',
        clientSecret: 'foobar'
      }
    }
  }, {
    name: 'LDAP',
    middleware: LdapMiddleware,
    config: {
      ldap: {}
    }
  }, {
    name: 'OAuth2',
    middleware: OAuth2Middleware,
    config: {
      oauth2: {
        clientID: 'foobar',
        clientSecret: 'foobar',
        authorizationURL: 'foobar',
        tokenURL: 'foobar',
        userProfileURL: 'foobar',
        scope: 'foobar'
      }
    }
  }, {
    name: 'Email',
    middleware: EmailMiddleware,
    config: {}
  }, {
    name: 'OpenID',
    middleware: OPenIDMiddleware,
    config: {}
  }]

  middlewareList.forEach((middleware) => {
    describe(middleware.name + 'Middleware', () => {
      before(() => {
        ImportMock.mockOther(configModule, 'config', middleware.config)
      })
      it('can be instantiated', () => {
        assert.ok(middleware.middleware.getMiddleware())
      })
    })
  })
})
