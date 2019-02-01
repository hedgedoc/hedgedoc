Configuration Using Config file
===

You can choose to configure CodiMD with either a config file or with
[environment variables](configuration-env-vars.md). The config file is processed
in [`lib/config/index.js`](../lib/config/index.js) - so this is the first
place to look if anything is missing not obvious from this document. The
default values are defined in [`lib/config/default.js`](../lib/config/default.js),
in case you wonder if you even need to override it.

Environment variables take precedence over configurations from the config files.
To get started, it is a good idea to take the `config.json.example` and copy it
to `config.json` before filling in your own details.


## Node.JS

| variables | example values | description |
| --------- | ------ | ----------- |
| `debug` | `true` or `false` | set debug mode, show more logs |


## CodiMD basics

| variables | example values | description |
| --------- | ------ | ----------- |
| `allowPDFExport` | `true` | Whether or not PDF export is offered. |
| `db` | `{ "dialect": "sqlite", "storage": "./db.codimd.sqlite" }` | set the db configs, [see more here](http://sequelize.readthedocs.org/en/latest/api/sequelize/) |
| `dbURL` | `mysql://localhost:3306/database` | set the db URL; if set, then db config (below) won't be applied |
| `forbiddenNoteIDs` | `['robots.txt']` | disallow creation of notes, even if `allowFreeUrl` is `true` |
| `loglevel` | `info` | Defines what kind of logs are provided to stdout. |
| `imageUploadType` | `imgur`, `s3`, `minio`, `azure`, `lutim` or `filesystem`(default) | Where to upload images. For S3, see our Image Upload Guides for [S3](guides/s3-image-upload.md) or [Minio](guides/minio-image-upload.md)|
| `sourceURL` | `https://github.com/codimd/server/tree/<current commit>` | Provides the link to the source code of CodiMD on the entry page (Please, make sure you change this when you run a modified version) |
| `staticCacheTime` | `1 * 24 * 60 * 60 * 1000` | static file cache time |
| `heartbeatInterval` | `5000` | socket.io heartbeat interval |
| `heartbeatTimeout` | `10000` | socket.io heartbeat timeout |
| `documentMaxLength` | `100000` | note max length |


## CodiMD paths stuff

these are rarely used for various reasons.

| variables | example values | description |
| --------- | ------ | ----------- |
| `defaultNotePath` | `./public/default.md` | default note file path<sup>1</sup>, empty notes will be created with this template. |
| `dhParamPath` | `./cert/dhparam.pem` | SSL dhparam path<sup>1</sup> (only need when you set `useSSL`) |
| `sslCAPath` | `['./cert/COMODORSAAddTrustCA.crt']` | SSL ca chain<sup>1</sup> (only need when you set `useSSL`) |
| `sslCertPath` | `./cert/codimd_io.crt` | SSL cert path<sup>1</sup> (only need when you set `useSSL`) |
| `sslKeyPath` | `./cert/client.key` | SSL key path<sup>1</sup> (only need when you set `useSSL`) |
| `tmpPath` | `./tmp/` | temp directory path<sup>1</sup> |
| `docsPath` | `./public/docs` | docs directory path<sup>1</sup> |
| `viewPath` | `./public/views` | template directory path<sup>1</sup> |
| `uploadsPath` | `./public/uploads` | uploads directory<sup>1</sup> - needs to be persistent when you use imageUploadType `filesystem` |


## CodiMD Location

| variables | example values | description |
| --------- | ------ | ----------- |
| `domain` | `localhost` | domain name |
| `urlPath` | `codimd` | sub URL path, like `www.example.com/<urlpath>` |
| `host` | `localhost` | interface/ip to listen on |
| `port` | `80` | port to listen on |
| `path` | `/var/run/codimd.sock` | path to UNIX domain socket to listen on (if specified, `host` and `port` are ignored) |
| `protocolUseSSL` | `true` or `false` | set to use SSL protocol for resources path (only applied when domain is set) |
| `useSSL` | `true` or `false` | set to use SSL server (if `true`, will auto turn on `protocolUseSSL`) |
| `urlAddPort` | `true` or `false` | set to add port on callback URL (ports `80` or `443` won't be applied) (only applied when domain is set) |
| `allowOrigin` | `['localhost']` | domain name whitelist |


## CSP and HSTS

| variables | example values | description |
| --------- | ------ | ----------- |
| `hsts` | `{"enable": true, "maxAgeSeconds": 31536000, "includeSubdomains": true, "preload": true}` | [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) options to use with HTTPS (default is the example value, max age is a year) |
| `csp` | `{"enable": true, "directives": {"scriptSrc": "trustworthy-scripts.example.com"}, "upgradeInsecureRequests": "auto", "addDefaults": true}` | Configures [Content Security Policy](https://helmetjs.github.io/docs/csp/). Directives are passed to Helmet - see [their documentation](https://helmetjs.github.io/docs/csp/) for more information on the format. Some defaults are added to the configured values so that the application doesn't break. To disable this behaviour, set `addDefaults` to `false`. Further, if `usecdn` is on, some CDN locations are allowed too. By default (`auto`), insecure (HTTP) requests are upgraded to HTTPS via CSP if `useSSL` is on. To change this behaviour, set `upgradeInsecureRequests` to either `true` or `false`. |

## Privacy and External Requests

| variables | example values | description |
| --------- | ------ | ----------- |
| `allowGravatar` | `true` or `false` | set to `false` to disable gravatar as profile picture source on your instance |
| `useCDN` | `true` or `false` | set to use CDN resources or not (default is `true`) |

## Users and Privileges

| variables | example values | description |
| --------- | ------ | ----------- |
| `allowAnonymous` | `true` or `false` | set to allow anonymous usage (default is `true`) |
| `allowAnonymousEdits` | `true` or `false` | if `allowAnonymous` is `true`: allow users to select `freely` permission, allowing guests to edit existing notes (default is `false`) |
| `allowFreeURL` | `true` or `false` | set to allow new note creation by accessing a nonexistent note URL |
| `defaultPermission` | `freely`, `editable`, `limited`, `locked`, `protected` or `private` | set notes default permission (only applied on signed users) |
| `sessionName` | `connect.sid` | cookie session name |
| `sessionLife` | `14 * 24 * 60 * 60 * 1000` | cookie session life |
| `sessionSecret` | `secret` | cookie session secret | If none is set, one will randomly generated on each startup, meaning all your users will be logged out. |


## Login methods

Most of these have never been documented for the config.json, feel free to expand these

### Email (local account)

| variables | example values | description |
| --------- | ------ | ----------- |
| `email` | `true` or `false` | set to allow email signin |
| `allowEmailRegister`  | `true` or `false` | set to allow email register (only applied when email is set, default is `true`. Note `bin/manage_users` might help you if registration is `false`.) |

### Dropbox Login
### Facebook Login
### GitHub Login
### GitLab Login
### Google Login
### LDAP Login
### Mattermost Login
### OAuth2 Login

| variables | example values | description |
| --------- | ------ | ----------- |
| `oauth2` | `{baseURL: ..., userProfileURL: ..., userProfileUsernameAttr: ..., userProfileDisplayNameAttr: ..., userProfileEmailAttr: ..., tokenURL: ..., authorizationURL: ..., clientID: ..., clientSecret: ...}` | An object detailing your OAuth2 provider. Refer to the [Mattermost](guides/auth/mattermost-self-hosted.md) or [Nextcloud](guides/auth/nextcloud.md) examples for more details!|

### SAML Login
### Twitter Login


## Upload Storage

Most of these have never been documented for the config.json, feel free to expand these


### Amazon S3

| variables | example values | description |
| --------- | ------ | ----------- |
| `s3` | `{ "accessKeyId": "YOUR_S3_ACCESS_KEY_ID", "secretAccessKey": "YOUR_S3_ACCESS_KEY", "region": "YOUR_S3_REGION" }` | When `imageuploadtype` be set to `s3`, you would also need to setup this key, check our [S3 Image Upload Guide](guides/s3-image-upload.md) |
| `s3bucket` | `YOUR_S3_BUCKET_NAME` | bucket name when `imageUploadType` is set to `s3` or `minio` |

### Azure Blob Storage
### imgur
### Minio

| variables | example values | description |
| --------- | ------ | ----------- |
| `minio` | `{ "accessKey": "YOUR_MINIO_ACCESS_KEY", "secretKey": "YOUR_MINIO_SECRET_KEY", "endpoint": "YOUR_MINIO_HOST", port: 9000, secure: true }` | When `imageUploadType` is set to `minio`, you need to set this key. Also check out our [Minio Image Upload Guide](guides/minio-image-upload.md) |

### Lutim

| variables | example values | description |
| --------- | ------ | ----------- |
|`lutim`| `{"url": "YOUR_LUTIM_URL"}`| When `imageUploadType` is set to `lutim`, you can setup the lutim url|

<sup>1</sup>: relative paths are based on CodiMD's base directory
