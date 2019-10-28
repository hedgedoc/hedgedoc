const fs = require('fs')
const os = require('os')
const path = require('path')
const convict = require('convict')

const appRootPath = path.resolve(__dirname, '../../')
const domainRegex = /\S+/

convict.addFormat({
  name: 'optional-path',
  validate: function (val) {
    if (typeof val !== 'string') {
      throw new Error('Path statements have to be strings!')
    }

    if (val !== '' && !fs.existsSync(val)) {
      throw new Error(`Path '${val}' doesn't exist!`)
    }
  },
  coerce: function (val) {
    return path.resolve(appRootPath, val.toString())
  }
})

convict.addFormat({
  name: 'existing-path',
  validate: function (val) {
    if (typeof val !== 'string') {
      throw new Error('Path statements have to be strings!')
    }

    if (!fs.existsSync(val)) {
      throw new Error(`Path '${val}' doesn't exist!`)
    }
  },
  coerce: function (val) {
    return path.resolve(appRootPath, val.toString())
  }
})

convict.addFormat({
  name: 'http-url',
  validate: function (val) {
    const url = new URL(val)
    if (!/^https?:/.test(url.protocol)) {
      throw new Error('Not a valid HTTP URL!')
    }
  }
})

convict.addFormat({
  name: 'semver',
  validate: function (val) {
    if (!/^\d+\.\d+\.\d+([-+].*)?$/.test(val)) {
      throw new Error('Not valid SemVer! See https://semver.org for details.')
    }
  }
})

// Define a schema
let config = convict({
  debug: {
    doc: 'Enable debug mode for CodiMD.',
    format: 'Boolean',
    env: 'DEBUG',
    default: false
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  domain: {
    doc: 'Domain used for CodiMD. Without this set, some functionality might be broken.',
    format: function (val) {
      if (val !== undefined && !domainRegex.test(val)) {
        throw new Error('Domain not valid, please provide a proper domain name. For example: example.com or codimd.example.com')
      }
    },
    env: 'CMD_DOMAIN',
    default: undefined
  },
  urlPath: {
    doc: 'Sub-URL-path, like `example.com/<urlpath>`',
    format: 'String',
    env: 'CMD_URL_PATH',
    default: ''
  },
  host: {
    doc: 'IP address CodiMD should bind to. 0.0.0.0 and :: will be interpreted as all IPs of the host.',
    format: 'ipaddress',
    env: 'CMD_HOST',
    default: '0.0.0.0'
  },
  port: {
    doc: 'Port CodiMD should bind to.',
    format: 'port',
    env: 'CMD_PORT',
    default: 3000
  },
  path: {
    doc: 'UNIX socket path to listen on, as alternative to regular TCP socket listening',
    format: 'optional-path',
    env: 'CMD_PATH',
    default: undefined
  },
  loglevel: {
    doc: 'Defines what kind of logs are provided to stdout. Available options: `debug`, `verbose`, `info`, `warn`, `error`',
    format: function (val) {
      if (!/(debug|verbose|info|warn|error)/.test(val)) {
        throw new Error('Loglevel has to be set to `debug`, `verbose`, `info`, `warn`, or `error`')
      }
    },
    env: 'CMD_LOGLEVEL',
    default: 'info'
  },
  urlAddPort: {
    doc: 'set to add port on callback URL (ports `80` or `443` won\'t be applied) (only applied when domain is set)',
    format: 'Boolean',
    env: 'CMD_URL_ADDPORT',
    default: false
  },
  allowOrigin: {
    doc: 'CORS whitelist for non-API calls',
    format: function (val) {
      for (let i = val.length; i--;) {
        if (!domainRegex.test(val[i])) {
          throw new Error(`CORS array contains invalid domain name '${val[i]}'`)
        }
      }
    },
    env: 'CMD_ALLOW_ORIGIN',
    default: ['localhost']
  },
  useSSL: {
    doc: 'Set to use SSL server (if `true`, will auto turn on `protocolUseSSL`',
    format: 'Boolean',
    env: 'CMD_USESSL',
    default: false
  },
  hsts: {
    enable: {
      doc: 'Set to enable [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) if HTTPS is also enabled',
      format: 'Boolean',
      env: 'CMD_HSTS_ENABLE',
      default: true
    },
    maxAgeSeconds: {
      doc: 'Maximum duration in seconds to tell clients to keep HSTS status',
      format: 'nat',
      env: 'CMD_HSTS_MAX_AGE',
      default: 60 * 60 * 24 * 365
    },
    includeSubDomains: {
      doc: 'Set to include subdomains in HSTS',
      format: 'Boolean',
      env: 'CMD_HSTS_INCLUDE_SUBDOMAINS',
      default: true
    },
    preload: {
      doc: 'whether to allow preloading of the site\'s HSTS status (e.g. into browsers)',
      format: 'Boolean',
      env: 'CMD_HSTS_PRELOAD',
      default: true
    }
  },
  csp: {
    enable: {
      doc: 'whether to enable Content Security Policy.',
      format: 'Boolean',
      env: 'CMD_CSP_ENABLE',
      default: true
    },
    directives: {
      doc: 'Additional CSP directives to the default ones required for CodiMD to work.',
      default: {}
    },
    addDefaults: {
      doc: 'Option to control whenever the recommended CSP directives should be add.',
      format: 'Boolean',
      default: true
    },
    addDisqus: {
      doc: 'Option to disable the addition of Disqus rules to CSP. Disabling this option will break the Disqus integration.',
      format: 'Boolean',
      default: true
    },
    addGoogleAnalytics: {
      doc: 'Option to disable the addition of Google Analytics rules to CSP. Disabling this option will break the Google Analytics integration.',
      format: 'Boolean',
      default: true
    },
    upgradeInsecureRequests: {
      default: 'auto'
    },
    reportURI: {
      doc: 'Allows to add a URL for CSP reports in case of violations.',
      format: '*',
      env: 'CMD_CSP_REPORTURI',
      default: undefined
    }
  },
  protocolUseSSL: {
    doc: 'Set to use TLS protocol for resources path (only applied when domain is set).',
    format: 'Boolean',
    env: 'CMD_PROTOCOL_USESSL',
    default: false
  },
  useCDN: {
    doc: 'Set to use CDN resources or not',
    format: 'Boolean',
    env: 'CMD_USECDN',
    default: true
  },
  allowAnonymous: {
    doc: 'Set to allow anonymous usage. (Allow guests general usage of CodiMD.)',
    format: 'Boolean',
    env: 'CMD_ALLOW_ANONYMOUS',
    default: true
  },
  allowAnonymousEdits: {
    doc: 'If `allowAnonymous` is `true`: allow users to select `freely` permission, allowing guests to edit existing notes.',
    format: 'Boolean',
    env: 'CMD_ALLOW_ANONYMOUS_EDITS',
    default: false
  },
  allowFreeURL: {
    doc: 'Set to allow new note creation by accessing a nonexistent note URL. This is the behavior familiar from [Etherpad](https://github.com/ether/etherpad-lite).',
    format: 'Boolean',
    env: 'CMD_ALLOW_FREEURL',
    default: false
  },
  forbiddenNoteIDs: {
    doc: 'List of note IDs that can\'t be used. Main purpose is to prevent bugs due usage of paths in free-url-mode.',
    env: 'CMD_FORBIDDEN_NOTE_IDS',
    default: ['robots.txt', 'favicon.ico', 'api', 'build', 'css', 'docs', 'fonts', 'js', 'uploads', 'vendor', 'views']
  },
  defaultPermission: {
    doc: 'Set notes default permission (only applied on signed-in users).',
    format: function (val) {
      if (!/(freely|editable|limited|locked|protected|private)/.test(val)) {
        throw new Error('defaultPermission has to be set to `freely`, `editable`, `limited`, `locked`, `protected`, or `private`')
      }
    },
    env: 'CMD_DEFAULT_PERMISSION',
    default: 'editable'
  },
  dbURL: {
    doc: 'Database URL',
    format: '*',
    default: undefined,
    sensitive: true
  },
  db: {
    host: {
      doc: 'Database host name/IP',
      format: '*',
      default: undefined
    },
    name: {
      doc: 'Database name',
      format: '*',
      default: undefined
    }
  },
  // ssl path
  sslKeyPath: {
    doc: 'SSL private key path absolute or relative to CodiMD\'s base director (only need when you set `useSSL`)',
    format: 'optional-path',
    default: ''
  },
  sslCertPath: {
    doc: 'SSL certificate path absolute or relative to CodiMD\'s base director (only need when you set `useSSL`)',
    format: 'optional-path',
    default: ''
  },
  sslCAPath: {
    doc: 'SSL CA certificate path absolute or relative to CodiMD\'s base director (only need when you set `useSSL`)',
    format: 'optional-path',
    default: ''
  },
  dhParamPath: {
    doc: 'SSL DH parameter absolute or relative to CodiMD\'s base director (only need when you set `useSSL`)',
    format: 'optional-path',
    default: ''
  },
  // other path
  viewPath: {
    doc: 'Frontend template directory path.',
    format: 'existing-path',
    default: './public/views'
  },
  tmpPath: {
    doc: 'Path to temporarily store data.',
    format: 'existing-path',
    default: os.tmpdir()
  },
  defaultNotePath: {
    doc: 'Path to the default note content document. Can be used to create templates, prefill all notes, and provide default settings in note metadata',
    format: 'existing-path',
    default: './public/default.md'
  },
  docsPath: {
    doc: 'Path to public docs. Contains files like the release notes, impress, slide-example, features page and more.',
    format: 'existing-path',
    default: './public/docs'
  },
  uploadsPath: {
    doc: 'Path to uploads directory. When local uploads are allowed, the path to store pictures uploaded to the instance.',
    format: 'existing-path',
    default: './public/uploads'
  },
  // session
  sessionName: {
    doc: 'Name used by the cookies that stores the session information.',
    format: 'String',
    default: 'connect.sid'
  },
  sessionSecret: {
    doc: 'Secret used to encrypt session IDs and details.',
    format: 'String',
    env: 'CMD_SESSION_SECRET',
    default: 'secret',
    sensitive: true
  },
  sessionSecretLen: {
    doc: 'Length of the session secret generated when no session secret is defined in config.',
    format: 'nat',
    default: 128
  },
  sessionLife: {
    doc: 'Maximum time a session can be used without re-login.',
    format: 'nat',
    env: 'CMD_SESSION_LIFE',
    default: 14 * 24 * 60 * 60 * 1000 // 14 days
  },
  staticCacheTime: {
    doc: 'Time that static assets delivered from CodiMD are cached on the client.',
    format: 'nat',
    default: 1 * 24 * 60 * 60 * 1000 // 1 day
  },
  // socket.io
  heartbeatInterval: {
    doc: 'Time interval in milliseconds used for heartbeats that are send out by the client to check that the websocket connection is still conencted.',
    format: 'nat',
    default: 5000
  },
  heartbeatTimeout: {
    doc: 'Time in milliseconds that is allowed to pass without heartbeat before the websocket connection is considered disconnected.',
    format: 'nat',
    default: 10000
  },
  // too busy timeout
  tooBusyLag: {
    doc: 'Maximum lag allowed in the NodeJS event loop, before the CodiMD tells new connections, that the server is too busy at the moment, and handles existing requests first.',
    format: 'nat',
    env: 'CMD_TOOBUSY_LAG',
    default: 70
  },
  // document
  documentMaxLength: {
    doc: 'Maximum length of documents stored in CodiMD. Caution: Too high limits open your CodiMD instance up to easier DoS attacks.',
    format: 'nat',
    default: 100000
  },
  // image upload setting, available options are imgur/s3/filesystem/azure/lutim
  imageUploadType: {
    doc: 'Where to upload images. For S3, see our Image Upload Guides for [S3](guides/s3-image-upload.md) or [MinIO](guides/minio-image-upload.md)',
    format: function (val) {
      if (!/(imgur|s3|filesystem|azure|lutim|minio)/.test(val)) {
        throw new Error('imageUploadType has to be set to `filesystem`, `imgur`, `s3`, `minio`, `lutim`, or `azure`')
      }
    },
    default: 'filesystem'
  },
  lutim: {
    url: {
      default: {
        doc: 'Base URL of the lutim instance used to upload user\'s pictures.',
        format: 'http-url',
        default: 'https://framapic.org/'
      }
    }
  },
  imgur: {
    clientID: {
      doc: 'Client secret from imgur to not run through the public uploads API.',
      format: '*',
      default: undefined,
      sensitive: true
    }
  },
  s3: {
    accessKeyId: {
      format: '*',
      default: undefined
    },
    secretAccessKey: {
      format: '*',
      default: undefined,
      sensitive: true
    },
    region: {
      format: '*',
      default: undefined
    }
  },
  minio: {
    accessKey: {
      format: '*',
      env: 'CMD_MINIO_ACCESS_KEY',
      default: undefined
    },
    secretKey: {
      format: '*',
      env: 'CMD_MINIO_SECRET_KEY',
      default: undefined,
      sensitive: true
    },
    endPoint: {
      format: '*',
      env: 'CMD_MINIO_ENDPOINT',
      default: undefined
    },
    secure: {
      doc: 'If set to true, use HTTPS for the connection.',
      format: 'Boolean',
      env: 'CMD_MINIO_SECURE',
      default: true
    },
    port: {
      doc: 'Port used for uploads to minio',
      format: 'port',
      env: 'CMD_MINIO_PORT',
      default: 9000
    }
  },
  s3bucket: {
    format: '*',
    env: 'CMD_S3_BUCKET',
    default: undefined
  },
  azure: {
    connectionString: {
      format: '*',
      env: 'CMD_AZURE_CONNECTION_STRING',
      default: undefined
    },
    container: {
      format: '*',
      env: 'CMD_AZURE_CONTAINER',
      default: undefined
    }
  },
  // authentication
  oauth2: {
    providerName: {
      format: '*',
      env: 'CMD_OAUTH2_PROVIDERNAME',
      default: undefined
    },
    authorizationURL: {
      format: '*',
      env: 'CMD_OAUTH2_AUTHORIZATION_URL',
      default: undefined
    },
    tokenURL: {
      format: '*',
      env: 'CMD_OAUTH2_TOKEN_URL',
      default: undefined
    },
    clientID: {
      format: '*',
      env: 'CMD_OAUTH2_CLIENT_ID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_OAUTH2_CLIENT_SECRET',
      default: undefined,
      sensitive: true
    }
  },
  facebook: {
    clientID: {
      format: '*',
      env: 'CMD_FACEBOOK_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_FACEBOOK_CLIENTSECRET',
      default: undefined,
      sensitive: true
    }
  },
  twitter: {
    consumerKey: {
      format: '*',
      env: 'CMD_TWITTER_CONSUMERKEY',
      default: undefined
    },
    consumerSecret: {
      format: '*',
      env: 'CMD_TWITTER_CONSUMERSECRET',
      default: undefined,
      sensitive: true
    }
  },
  github: {
    clientID: {
      format: '*',
      env: 'CMD_GITHUB_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_GITHUB_CLIENTSECRET',
      default: undefined,
      sensitive: true
    }
  },
  gitlab: {
    baseURL: {
      format: '*',
      env: 'CMD_GITLAB_BASEURL',
      default: undefined
    },
    clientID: {
      format: '*',
      env: 'CMD_GITLAB_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_GITLAB_CLIENTSECRET',
      default: undefined,
      sensitive: true
    },
    scope: {
      format: '*',
      env: 'CMD_GITLAB_SCOPE',
      default: undefined
    },
    version: {
      format: function (val) {
        if (!/v(3|4)/.test(val)) {
          throw new Error('Unsupported GitLab API version specified')
        }
      },
      default: 'v4'
    }
  },
  mattermost: {
    baseURL: {
      format: '*',
      env: 'CMD_MATTERMOST_BASEURL',
      default: undefined
    },
    clientID: {
      format: '*',
      env: 'CMD_MATTERMOST_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_MATTERMOST_CLIENTSECRET',
      default: undefined,
      sensitive: true
    }
  },
  dropbox: {
    clientID: {
      format: '*',
      env: 'CMD_DROPBOX_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_DROPBOX_CLIENTSECRET',
      default: undefined,
      sensitive: true
    },
    appKey: {
      format: '*',
      env: 'CMD_DROPBOX_APPKEY',
      default: undefined
    }
  },
  google: {
    clientID: {
      format: '*',
      env: 'CMD_GOOGLE_CLIENTID',
      default: undefined
    },
    clientSecret: {
      format: '*',
      env: 'CMD_GOOGLE_CLIENTSECRET',
      default: undefined,
      sensitive: true
    }
  },
  ldap: {
    providerName: {
      format: '*',
      env: 'CMD_LDAP_PROVIDERNAME',
      default: undefined
    },
    url: {
      format: '*',
      env: 'CMD_LDAP_URL',
      default: undefined
    },
    bindDn: {
      format: '*',
      env: 'CMD_LDAP_BINDDN',
      default: undefined
    },
    bindCredentials: {
      format: '*',
      env: 'CMD_LDAP_BINDCREDENTIALS',
      default: undefined,
      sensitive: true
    },
    searchBase: {
      format: '*',
      env: 'CMD_LDAP_SEARCHBASE',
      default: undefined
    },
    searchFilter: {
      format: '*',
      env: 'CMD_LDAP_SEARCHFILTER',
      default: undefined
    },
    searchAttributes: {
      format: '*',
      env: 'CMD_LDAP_SEARCHATTRIBUTES',
      default: undefined
    },
    usernameField: {
      format: '*',
      env: 'CMD_LDAP_USERNAMEFIELD',
      default: undefined
    },
    useridField: {
      format: '*',
      env: 'CMD_LDAP_USERIDFIELD',
      default: undefined
    },
    tlsca: {
      format: '*',
      env: 'CMD_LDAP_TLS_CA',
      default: undefined
    },
    tlsOptions: {
      format: '*',
      default: undefined
    }
  },
  saml: {
    idpSsoUrl: {
      doc: 'Login URL for the SAML Identity Provider',
      format: '*',
      env: 'CMD_SAML_IDPSSOURL',
      default: undefined
    },
    idpCert: {
      doc: 'SAML Identity Provider certificate',
      format: '*',
      env: 'CMD_SAML_IDPCERT',
      default: undefined
    },
    issuer: {
      doc: 'SAML Identity Provider Identifier issuer',
      format: '*',
      env: 'CMD_SAML_ISSUER',
      default: undefined
    },
    identifierFormat: {
      doc: 'SAML Identity Provider format',
      env: 'CMD_SAML_IDENTIFIERFORMAT',
      default: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
    },
    disableRequestedAuthnContext: {
      doc: 'SAML if truthy, do not request a specific authentication context. This is known to help when authenticating against Active Directory (AD FS) servers.',
      format: 'Boolean',
      env: 'CMD_SAML_DISABLEREQUESTEDAUTHNCONTEXT',
      default: false
    },
    groupAttribute: {
      format: '*',
      env: 'CMD_SAML_GROUPATTRIBUTE',
      default: undefined
    },
    externalGroups: { default: [] },
    requiredGroups: { default: [] },
    attribute: {
      id: {
        format: '*',
        env: 'CMD_SAML_ATTRIBUTE_ID',
        default: undefined
      },
      username: {
        format: '*',
        env: 'CMD_SAML_ATTRIBUTE_USERNAME',
        default: undefined
      },
      email: {
        format: '*',
        env: 'CMD_SAML_ATTRIBUTE_EMAIL',
        default: undefined
      }
    }
  },
  email: {
    doc: 'Allow users to sign-in using their E-Mail address.',
    default: true,
    env: 'CMD_EMAIL',
    format: 'Boolean'
  },
  allowEmailRegister: {
    doc: 'Allow users to sign up using their E-Mail. Requires email to be set to true.',
    default: true,
    env: 'CMD_ALLOW_EMAIL_REGISTER',
    format: 'Boolean'
  },
  allowGravatar: {
    doc: 'Allow the usage of Libravatar for user profile pictures.',
    default: true,
    env: 'CMD_ALLOW_GRAVATAR',
    format: 'Boolean'
  },
  allowPDFExport: {
    doc: 'Allow PDF export documents as PDF.',
    default: true,
    env: 'CMD_ALLOW_PDF_EXPORT',
    format: 'Boolean'
  },
  openID: {
    doc: 'Allow OpenID as authentication method.',
    default: false,
    env: 'CMD_OPENID',
    format: 'Boolean'
  },
  linkifyHeaderStyle: {
    doc: 'Default linking style for headers used by the markdown rendering engine for notes',
    format: function (val) {
      // linkifyHeaderStyle - How is a header text converted into a link id.
      // Header Example: "3.1. Good Morning my Friend! - Do you have 5$?"
      // * 'keep-case' is the legacy CodiMD value.
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
      if (!/(keep-case|lower-case|gfm)/.test(val)) {
        throw new Error('Value has to be \'keep-case\' or \'gfm\'')
      }
    },
    default: 'keep-case',
    env: 'CMD_LINKIFY_HEADER_STYLE'
  },
  version: {
    doc: 'Version number of CodiMD',
    format: 'semver',
    default: null
  },
  minimumCompatibleVersion: {
    doc: 'Version number of compatible CodiMD frontends',
    format: 'semver',
    default: '1.1.0'
  },
  fullversion: {
    doc: 'Full version number of CodiMD (might contains a commit hash)',
    format: 'semver',
    default: null
  },
  sourceURL: {
    doc: 'Link to the source code repository',
    format: 'http-url',
    default: 'https://github.com/codimd/server'
  },
  allowedUploadMimeTypes: {
    doc: 'MimeTypes that are allowed to be uploaded as images',
    format: 'Array',
    default: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/svg+xml'
    ]
  },
  isFacebookEnable: {
    default: false
  },
  isGoogleEnable: {
    default: false
  },
  isDropboxEnable: {
    default: false
  },
  isTwitterEnable: {
    default: false
  },
  isEmailEnable: {
    default: false
  },
  isOpenIDEnable: {
    default: false
  },
  isGitHubEnable: {
    default: false
  },
  isGitLabEnable: {
    default: false
  },
  isMattermostEnable: {
    default: false
  },
  isLDAPEnable: {
    default: false
  },
  isSAMLEnable: {
    default: false
  },
  isOAuth2Enable: {
    default: false
  },
  isPDFExportEnable: {
    default: false
  },
  serverURL: {
    default: ''
  },
  permisson: {
    default: []
  },
  updateI18nFiles: {
    default: false
  }
})

module.exports = config
