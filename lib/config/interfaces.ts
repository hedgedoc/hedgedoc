import { Permission } from './enum'

export interface CSPDirectives {
  defaultSrc?: string[];
  scriptSrc?: string[];
  imgSrc?: string[];
  styleSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  childSrc?: string[];
  connectSrc?: string[];
}

export interface Config {
  permission: Permission;
  domain: string;
  urlPath: string;
  host: string;
  port: number;
  loglevel: string;
  urlAddPort: boolean;
  allowOrigin: string[];
  useSSL: boolean;
  hsts: {
    enable: boolean;
    maxAgeSeconds: number;
    includeSubdomains: boolean;
    preload: boolean;
  };
  csp: {
    enable: boolean;
    directives?: CSPDirectives;
    addDefaults: boolean;
    addDisqus: boolean;
    addGoogleAnalytics: boolean;
    upgradeInsecureRequests: string | boolean;
    reportURI?: string;
  };
  protocolUseSSL: boolean;
  useCDN: boolean;
  allowAnonymous: boolean;
  allowAnonymousEdits: boolean;
  allowFreeURL: boolean;
  forbiddenNoteIDs: string[];
  defaultPermission: string;
  dbURL: string;
  db: any;
  sslKeyPath: string;
  sslCertPath: string;
  sslCAPath: string[];
  dhParamPath: string;
  publicPath: string;
  viewPath: string;
  tmpPath: string;
  defaultNotePath: string;
  docsPath: string;
  uploadsPath: string;
  sessionName: string;
  sessionSecret: string;
  sessionSecretLen: number;
  sessionLife: number;
  staticCacheTime: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  tooBusyLag: number;
  documentMaxLength: number;
  imageUploadType: string;
  lutim?: {
    url: string;
  };
  imgur?: {
    clientID: string;
  };
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  minio?: {
    accessKey?: string;
    secretKey?: string;
    endPoint?: string;
    secure?: boolean;
    port?: number;
  };
  s3bucket?: string;
  azure?: {
    connectionString: string;
    container: string;
  };
  oauth2?: {
    providerName: string;
    authorizationURL: string;
    tokenURL: string;
    clientID: string;
    clientSecret: string;
  };
  facebook?: {
    clientID: string;
    clientSecret: string;
  };
  twitter?: {
    consumerKey: string;
    consumerSecret: string;
  };
  github?: {
    clientID: string;
    clientSecret: string;
  };
  gitlab?: {
    baseURL?: string;
    clientID?: string;
    clientSecret?: string;
    scope?: string;
    version?: string;
  };
  dropbox?: {
    clientID: string;
    clientSecret: string;
    appKey: string;
  };
  google?: {
    clientID: string;
    clientSecret: string;
    hostedDomain: string;
  };
  ldap?: {
    providerName: string;
    url: string;
    bindDn: string;
    bindCredentials: string;
    searchBase: string;
    searchFilter: string;
    searchAttributes: string;
    usernameField: string;
    useridField: string;
    tlsca: string;
    tlsOptions: {
      ca: string[];
    };
  };
  saml?: {
    idpSsoUrl?: string;
    idpCert?: string;
    issuer?: string;
    identifierFormat?: string;
    disableRequestedAuthnContext?: boolean;
    groupAttribute?: string;
    externalGroups?: string[];
    requiredGroups?: string[];
    attribute?: {
      id?: string;
      username?: string;
      email?: string;
    };
  };
  email: boolean;
  allowEmailRegister: boolean;
  allowGravatar: boolean;
  openID: boolean;
  linkifyHeaderStyle: string;

  // TODO: Remove escape hatch for dynamically added properties
  [propName: string]: any;
}
