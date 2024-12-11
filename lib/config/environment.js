'use strict'

const { toBooleanConfig, toArrayConfig, toIntegerConfig } = require('./utils')

module.exports = {
  sourceURL: process.env.CMD_SOURCE_URL,
  domain: process.env.CMD_DOMAIN,
  urlPath: process.env.CMD_URL_PATH,
  host: process.env.CMD_HOST,
  port: toIntegerConfig(process.env.CMD_PORT),
  path: process.env.CMD_PATH,
  loglevel: process.env.CMD_LOGLEVEL,
  urlAddPort: toBooleanConfig(process.env.CMD_URL_ADDPORT),
  useSSL: toBooleanConfig(process.env.CMD_USESSL),
  hsts: {
    enable: toBooleanConfig(process.env.CMD_HSTS_ENABLE),
    maxAgeSeconds: toIntegerConfig(process.env.CMD_HSTS_MAX_AGE),
    includeSubdomains: toBooleanConfig(process.env.CMD_HSTS_INCLUDE_SUBDOMAINS),
    preload: toBooleanConfig(process.env.CMD_HSTS_PRELOAD)
  },
  csp: {
    enable: toBooleanConfig(process.env.CMD_CSP_ENABLE),
    reportURI: process.env.CMD_CSP_REPORTURI,
    addDisqus: toBooleanConfig(process.env.CMD_CSP_ADD_DISQUS),
    addGoogleAnalytics: toBooleanConfig(process.env.CMD_CSP_ADD_GOOGLE_ANALYTICS),
    allowFraming: toBooleanConfig(process.env.CMD_CSP_ALLOW_FRAMING),
    allowPDFEmbed: toBooleanConfig(process.env.CMD_CSP_ALLOW_PDF_EMBED)
  },
  rateLimitNewNotes: toIntegerConfig(process.env.CMD_RATE_LIMIT_NEW_NOTES),
  cookiePolicy: process.env.CMD_COOKIE_POLICY,
  protocolUseSSL: toBooleanConfig(process.env.CMD_PROTOCOL_USESSL),
  allowOrigin: toArrayConfig(process.env.CMD_ALLOW_ORIGIN),
  allowAnonymous: toBooleanConfig(process.env.CMD_ALLOW_ANONYMOUS),
  allowAnonymousEdits: toBooleanConfig(process.env.CMD_ALLOW_ANONYMOUS_EDITS),
  allowFreeURL: toBooleanConfig(process.env.CMD_ALLOW_FREEURL),
  requireFreeURLAuthentication: toBooleanConfig(process.env.CMD_REQUIRE_FREEURL_AUTHENTICATION),
  disableNoteCreation: toBooleanConfig(process.env.CMD_DISABLE_NOTE_CREATION),
  forbiddenNoteIDs: toArrayConfig(process.env.CMD_FORBIDDEN_NOTE_IDS),
  defaultPermission: process.env.CMD_DEFAULT_PERMISSION,
  dbURL: process.env.CMD_DB_URL,
  db: {
    username: process.env.CMD_DB_USERNAME,
    password: process.env.CMD_DB_PASSWORD,
    host: process.env.CMD_DB_HOST,
    port: process.env.CMD_DB_PORT,
    database: process.env.CMD_DB_DATABASE,
    dialect: process.env.CMD_DB_DIALECT
  },
  sessionSecret: process.env.CMD_SESSION_SECRET,
  sessionLife: toIntegerConfig(process.env.CMD_SESSION_LIFE),
  tooBusyLag: toIntegerConfig(process.env.CMD_TOOBUSY_LAG),
  documentMaxLength: toIntegerConfig(process.env.CMD_DOCUMENT_MAX_LENGTH),
  imageUploadType: process.env.CMD_IMAGE_UPLOAD_TYPE,
  imgur: {
    clientID: process.env.CMD_IMGUR_CLIENTID
  },
  s3: {
    accessKeyId: process.env.CMD_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMD_S3_SECRET_ACCESS_KEY,
    region: process.env.CMD_S3_REGION,
    endpoint: process.env.CMD_S3_ENDPOINT
  },
  s3bucket: process.env.CMD_S3_BUCKET,
  s3folder: process.env.CMD_S3_FOLDER,
  s3publicFiles: process.env.CMD_S3_PUBLIC_FILES,
  minio: {
    accessKey: process.env.CMD_MINIO_ACCESS_KEY,
    secretKey: process.env.CMD_MINIO_SECRET_KEY,
    endPoint: process.env.CMD_MINIO_ENDPOINT,
    secure: toBooleanConfig(process.env.CMD_MINIO_SECURE),
    port: toIntegerConfig(process.env.CMD_MINIO_PORT)
  },
  lutim: {
    url: process.env.CMD_LUTIM_URL
  },
  azure: {
    connectionString: process.env.CMD_AZURE_CONNECTION_STRING,
    container: process.env.CMD_AZURE_CONTAINER
  },
  facebook: {
    clientID: process.env.CMD_FACEBOOK_CLIENTID,
    clientSecret: process.env.CMD_FACEBOOK_CLIENTSECRET
  },
  twitter: {
    consumerKey: process.env.CMD_TWITTER_CONSUMERKEY,
    consumerSecret: process.env.CMD_TWITTER_CONSUMERSECRET
  },
  github: {
    clientID: process.env.CMD_GITHUB_CLIENTID,
    clientSecret: process.env.CMD_GITHUB_CLIENTSECRET
  },
  gitlab: {
    baseURL: process.env.CMD_GITLAB_BASEURL,
    clientID: process.env.CMD_GITLAB_CLIENTID,
    clientSecret: process.env.CMD_GITLAB_CLIENTSECRET,
    scope: process.env.CMD_GITLAB_SCOPE
  },
  mattermost: {
    baseURL: process.env.CMD_MATTERMOST_BASEURL,
    clientID: process.env.CMD_MATTERMOST_CLIENTID,
    clientSecret: process.env.CMD_MATTERMOST_CLIENTSECRET
  },
  oauth2: {
    providerName: process.env.CMD_OAUTH2_PROVIDERNAME,
    baseURL: process.env.CMD_OAUTH2_BASEURL,
    userProfileURL: process.env.CMD_OAUTH2_USER_PROFILE_URL,
    userProfileIdAttr: process.env.CMD_OAUTH2_USER_PROFILE_ID_ATTR,
    userProfileUsernameAttr: process.env.CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR,
    userProfileDisplayNameAttr: process.env.CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR,
    userProfileEmailAttr: process.env.CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR,
    tokenURL: process.env.CMD_OAUTH2_TOKEN_URL,
    authorizationURL: process.env.CMD_OAUTH2_AUTHORIZATION_URL,
    clientID: process.env.CMD_OAUTH2_CLIENT_ID,
    clientSecret: process.env.CMD_OAUTH2_CLIENT_SECRET,
    scope: process.env.CMD_OAUTH2_SCOPE,
    rolesClaim: process.env.CMD_OAUTH2_ROLES_CLAIM,
    accessRole: process.env.CMD_OAUTH2_ACCESS_ROLE
  },
  dropbox: {
    clientID: process.env.CMD_DROPBOX_CLIENTID,
    clientSecret: process.env.CMD_DROPBOX_CLIENTSECRET,
    appKey: process.env.CMD_DROPBOX_APPKEY
  },
  google: {
    clientID: process.env.CMD_GOOGLE_CLIENTID,
    clientSecret: process.env.CMD_GOOGLE_CLIENTSECRET,
    hostedDomain: process.env.CMD_GOOGLE_HOSTEDDOMAIN
  },
  ldap: {
    providerName: process.env.CMD_LDAP_PROVIDERNAME,
    url: process.env.CMD_LDAP_URL,
    bindDn: process.env.CMD_LDAP_BINDDN,
    bindCredentials: process.env.CMD_LDAP_BINDCREDENTIALS,
    searchBase: process.env.CMD_LDAP_SEARCHBASE,
    searchFilter: process.env.CMD_LDAP_SEARCHFILTER,
    searchAttributes: toArrayConfig(process.env.CMD_LDAP_SEARCHATTRIBUTES),
    usernameField: process.env.CMD_LDAP_USERNAMEFIELD,
    useridField: process.env.CMD_LDAP_USERIDFIELD,
    tlsca: process.env.CMD_LDAP_TLS_CA
  },
  saml: {
    providerName: process.env.CMD_SAML_PROVIDERNAME,
    idpSsoUrl: process.env.CMD_SAML_IDPSSOURL,
    idpCert: process.env.CMD_SAML_IDPCERT,
    clientCert: process.env.CMD_SAML_CLIENTCERT,
    issuer: process.env.CMD_SAML_ISSUER,
    identifierFormat: process.env.CMD_SAML_IDENTIFIERFORMAT,
    disableRequestedAuthnContext: toBooleanConfig(process.env.CMD_SAML_DISABLEREQUESTEDAUTHNCONTEXT),
    groupAttribute: process.env.CMD_SAML_GROUPATTRIBUTE,
    externalGroups: toArrayConfig(process.env.CMD_SAML_EXTERNALGROUPS, '|', []),
    requiredGroups: toArrayConfig(process.env.CMD_SAML_REQUIREDGROUPS, '|', []),
    attribute: {
      id: process.env.CMD_SAML_ATTRIBUTE_ID,
      username: process.env.CMD_SAML_ATTRIBUTE_USERNAME,
      email: process.env.CMD_SAML_ATTRIBUTE_EMAIL
    }
  },
  email: toBooleanConfig(process.env.CMD_EMAIL),
  allowEmailRegister: toBooleanConfig(process.env.CMD_ALLOW_EMAIL_REGISTER),
  allowGravatar: toBooleanConfig(process.env.CMD_ALLOW_GRAVATAR),
  openID: toBooleanConfig(process.env.CMD_OPENID),
  linkifyHeaderStyle: process.env.CMD_LINKIFY_HEADER_STYLE,
  enableStatsApi: toBooleanConfig(process.env.CMD_ENABLE_STATS_API)
}
