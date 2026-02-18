'use strict'

import * as fs from 'fs'
import * as path from 'path'

const basePath: string = path.resolve('/run/secrets/')

function getSecret (secret: string): string | undefined {
  const filePath = path.join(basePath, secret)
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8')
  return undefined
}

const dockerSecrets = fs.existsSync(basePath) ? {
  dbURL: getSecret('dbURL'),
  sessionSecret: getSecret('sessionsecret'),
  sslKeyPath: getSecret('sslkeypath'),
  sslCertPath: getSecret('sslcertpath'),
  sslCAPath: getSecret('sslcapath'),
  dhParamPath: getSecret('dhparampath'),
  s3: {
    accessKeyId: getSecret('s3_acccessKeyId'),
    secretAccessKey: getSecret('s3_secretAccessKey')
  },
  azure: {
    connectionString: getSecret('azure_connectionString')
  },
  facebook: {
    clientID: getSecret('facebook_clientID'),
    clientSecret: getSecret('facebook_clientSecret')
  },
  twitter: {
    consumerKey: getSecret('twitter_consumerKey'),
    consumerSecret: getSecret('twitter_consumerSecret')
  },
  github: {
    clientID: getSecret('github_clientID'),
    clientSecret: getSecret('github_clientSecret')
  },
  gitlab: {
    clientID: getSecret('gitlab_clientID'),
    clientSecret: getSecret('gitlab_clientSecret')
  },
  mattermost: {
    clientID: getSecret('mattermost_clientID'),
    clientSecret: getSecret('mattermost_clientSecret')
  },
  dropbox: {
    clientID: getSecret('dropbox_clientID'),
    clientSecret: getSecret('dropbox_clientSecret'),
    appKey: getSecret('dropbox_appKey')
  },
  google: {
    clientID: getSecret('google_clientID'),
    clientSecret: getSecret('google_clientSecret'),
    hostedDomain: getSecret('google_hostedDomain')
  },
  imgur: getSecret('imgur_clientid'),
  oauth2: {
    clientID: getSecret('oauth2_clientID'),
    clientSecret: getSecret('oauth2_clientSecret')
  }
} : undefined

export = dockerSecrets
