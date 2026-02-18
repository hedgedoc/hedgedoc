'use strict'

import * as os from 'os'

const defaultConfig = {
  domain: '',
  urlPath: '',
  host: '0.0.0.0',
  port: 3000,
  loglevel: 'info',
  urlAddPort: false,
  allowOrigin: ['localhost'],
  useSSL: false,
  hsts: {
    enable: true,
    maxAgeSeconds: 60 * 60 * 24 * 365,
    includeSubdomains: true,
    preload: false
  },
  csp: {
    enable: true,
    directives: {
    },
    addDefaults: true,
    addDisqus: false,
    addGoogleAnalytics: false,
    upgradeInsecureRequests: 'auto' as string | boolean,
    reportURI: undefined as string | undefined,
    allowFraming: true,
    allowPDFEmbed: true
  },
  rateLimitNewNotes: 20,
  cookiePolicy: 'lax',
  protocolUseSSL: false,
  // permissions
  allowAnonymous: true,
  allowAnonymousEdits: false,
  allowFreeURL: false,
  requireFreeURLAuthentication: false,
  disableNoteCreation: false,
  forbiddenNoteIDs: ['robots.txt', 'favicon.ico', 'api', 'build', 'css', 'docs', 'fonts', 'js', 'uploads', 'vendor', 'views'],
  defaultPermission: 'editable',
  enableUploads: undefined as string | undefined, // 'all', 'registered', 'none' are valid options.
  // This is undefined by default and set during runtime based on allowAnonymous and allowAnonymousEdits for backwards-compatibility unless explicitly set.
  dbURL: '',
  db: {} as Record<string, any>,
  // ssl path
  sslKeyPath: '',
  sslCertPath: '',
  sslCAPath: '' as string | string[],
  dhParamPath: '',
  // other path
  viewPath: './public/views',
  tmpPath: os.tmpdir(),
  defaultNotePath: './public/default.md',
  docsPath: './public/docs',
  uploadsPath: './public/uploads',
  // session
  sessionName: 'connect.sid',
  sessionSecret: 'secret',
  sessionSecretLen: 128,
  sessionLife: 14 * 24 * 60 * 60 * 1000, // 14 days
  staticCacheTime: 1 * 24 * 60 * 60 * 1000, // 1 day
  // socket.io
  heartbeatInterval: 5000,
  heartbeatTimeout: 10000,
  // too busy timeout
  tooBusyLag: 70,
  // document
  documentMaxLength: 100000,
  // image upload setting, available options are imgur/s3/filesystem/azure/lutim
  imageUploadType: 'filesystem',
  lutim: {
    url: 'https://framapic.org/'
  },
  imgur: {
    clientID: undefined as string | undefined
  },
  s3: {
    accessKeyId: undefined as string | undefined,
    secretAccessKey: undefined as string | undefined,
    region: undefined as string | undefined
  },
  s3bucket: undefined as string | undefined,
  s3folder: 'uploads',
  s3publicFiles: false as boolean | string,
  minio: {
    accessKey: undefined as string | undefined,
    secretKey: undefined as string | undefined,
    endPoint: undefined as string | undefined,
    secure: true,
    port: 9000
  },
  azure: {
    connectionString: undefined as string | undefined,
    container: undefined as string | undefined
  },
  // authentication
  oauth2: {
    providerName: undefined as string | undefined,
    authorizationURL: undefined as string | undefined,
    tokenURL: undefined as string | undefined,
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined,
    scope: undefined as string | undefined,
    pkce: false
  },
  facebook: {
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined
  },
  twitter: {
    consumerKey: undefined as string | undefined,
    consumerSecret: undefined as string | undefined
  },
  github: {
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined
  },
  gitlab: {
    baseURL: undefined as string | undefined,
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined,
    scope: undefined as string | undefined,
    version: 'v4'
  },
  mattermost: {
    baseURL: undefined as string | undefined,
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined
  },
  dropbox: {
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined,
    appKey: undefined as string | undefined
  },
  google: {
    clientID: undefined as string | undefined,
    clientSecret: undefined as string | undefined,
    hostedDomain: undefined as string | undefined
  },
  ldap: {
    providerName: undefined as string | undefined,
    url: undefined as string | undefined,
    bindDn: undefined as string | undefined,
    bindCredentials: undefined as string | undefined,
    searchBase: undefined as string | undefined,
    searchFilter: undefined as string | undefined,
    searchAttributes: undefined as string | undefined,
    usernameField: undefined as string | undefined,
    useridField: undefined as string | undefined,
    tlsca: undefined as string | undefined
  },
  saml: {
    providerName: undefined as string | undefined,
    idpSsoUrl: undefined as string | undefined,
    idpCert: undefined as string | undefined,
    clientCert: undefined as string | undefined,
    issuer: undefined as string | undefined,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    disableRequestedAuthnContext: false,
    groupAttribute: undefined as string | undefined,
    externalGroups: [] as string[],
    requiredGroups: [] as string[],
    attribute: {
      id: undefined as string | undefined,
      username: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    },
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: true
  },
  email: true as boolean,
  allowEmailRegister: true,
  allowGravatar: true,
  openID: false,
  // linkifyHeaderStyle - How is a header text converted into a link id.
  // Header Example: "3.1. Good Morning my Friend! - Do you have 5$?"
  // * 'keep-case' is the legacy HedgeDoc value.
  //    Generated id: "31-Good-Morning-my-Friend---Do-you-have-5"
  // * 'lower-case' is the same like legacy (see above), but converted to lower-case.
  //    Generated id: "#31-good-morning-my-friend---do-you-have-5"
  // * 'gfm' _GitHub-Flavored Markdown_ style as described here:
  //    https://gist.github.com/asabaylus/3071099#gistcomment-1593627
  //    It works like 'lower-case', but making sure the ID is unique.
  //    This is What GitHub, GitLab and (hopefully) most other tools use.
  //    Generated id:   "31-good-morning-my-friend---do-you-have-5"
  //    2nd appearance: "31-good-morning-my-friend---do-you-have-5-1"
  //    3rd appearance: "31-good-morning-my-friend---do-you-have-5-2"
  linkifyHeaderStyle: 'keep-case',
  enableStatsApi: true
}

export = defaultConfig
