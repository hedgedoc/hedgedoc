Configuration Using Environment variables
===

You can choose to configure CodiMD with either a
[config file](configuration-config-file.md) or with environment variables.
Environment variables are processed in
[`lib/config/environment.js`](../lib/config/environment.js) - so this is the first
place to look if anything is missing not obvious from this document. The
default values are defined in [`lib/config/default.js`](../lib/config/default.js),
in case you wonder if you even need to override it.

Environment variables take precedence over configurations from the config files.
They generally start with `CMD_` for our own options, but we also list
node-specific options you can configure this way.


## Node.JS

| variable | example value | description |
| -------- | ------------- | ----------- |
| `NODE_ENV` | `production` or `development` | set current environment (will apply corresponding settings in the `config.json`) |
| `DEBUG` | `true` or `false` | set debug mode; show more logs |


## CodiMD basics

defaultNotePath can't be set from env-vars

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_ALLOW_PDF_EXPORT` | `true` or `false` | Enable or disable PDF exports |
| `CMD_CONFIG_FILE` | `/path/to/config.json` | optional override for the path to CodiMD's config file |
| `CMD_DB_URL` | `mysql://localhost:3306/database` | set the database URL |
| `CMD_LOGLEVEL` | `info`, `debug` ... | Defines what kind of logs are provided to stdout. |
| `CMD_FORBIDDEN_NOTE_IDS` | `'robots.txt'` | disallow creation of notes, even if `CMD_ALLOW_FREEURL` is `true` |
| `CMD_IMAGE_UPLOAD_TYPE` | `imgur`, `s3`, `minio`, `lutim` or `filesystem` | Where to upload images. For S3, see our Image Upload Guides for [S3](guides/s3-image-upload.md) or [Minio](guides/minio-image-upload.md), also there's a whole section on their respective env vars below. |
| `CMD_SOURCE_URL` | `https://github.com/codimd/server/tree/<current commit>` | Provides the link to the source code of CodiMD on the entry page (Please, make sure you change this when you run a modified version) |


## CodiMD Location

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_DOMAIN` | `codimd.org` | domain name |
| `CMD_URL_PATH` | `codimd` | If CodiMD is run from a subdirectory like `www.example.com/<urlpath>` |
| `CMD_HOST` | `localhost` | interface/ip to listen on |
| `CMD_PORT` | `80` | port to listen on |
| `CMD_PATH` | `/var/run/codimd.sock` | path to UNIX domain socket to listen on (if specified, `CMD_HOST` and `CMD_PORT` are ignored) |
| `CMD_PROTOCOL_USESSL` | `true` or `false` | set to use SSL protocol for resources path (only applied when domain is set) |
| `CMD_URL_ADDPORT` | `true` or `false` | set to add port on callback URL (ports `80` or `443` won't be applied) (only applied when domain is set) |
| `CMD_ALLOW_ORIGIN` | `localhost, codimd.org` | domain name whitelist (use comma to separate) |


## CSP and HSTS

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_CSP_ENABLE` | `true` | whether to enable Content Security Policy (directives cannot be configured with environment variables) |
| `CMD_CSP_REPORTURI` | `https://<someid>.report-uri.com/r/d/csp/enforce` | Allows to add a URL for CSP reports in case of violations |
| `CMD_HSTS_ENABLE` | ` true`  | set to enable [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) if HTTPS is also enabled (default is ` true`) |
| `CMD_HSTS_INCLUDE_SUBDOMAINS` | `true` | set to include subdomains in HSTS (default is `true`) |
| `CMD_HSTS_MAX_AGE` | `31536000` | max duration in seconds to tell clients to keep HSTS status (default is a year) |
| `CMD_HSTS_PRELOAD` | `true` | whether to allow preloading of the site's HSTS status (e.g. into browsers) |


## Privacy and External Requests

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_ALLOW_GRAVATAR` | `true` or `false` | set to `false` to disable gravatar as profile picture source on your instance |
| `CMD_USECDN` | `true` or `false` | set to use CDN resources or not|


## Users and Privileges

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_ALLOW_ANONYMOUS` | `true` or `false` | set to allow anonymous usage (default is `true`) |
| `CMD_ALLOW_ANONYMOUS_EDITS` | `true` or `false` | if `allowAnonymous` is `true`, allow users to select `freely` permission, allowing guests to edit existing notes (default is `false`) |
| `CMD_ALLOW_FREEURL` | `true` or `false` | set to allow new note creation by accessing a nonexistent note URL |
| `CMD_DEFAULT_PERMISSION` | `freely`, `editable`, `limited`, `locked` or `private` | set notes default permission (only applied on signed users) |
| `CMD_SESSION_LIFE` | `1209600000` | Session life time. (milliseconds) |
| `CMD_SESSION_SECRET` | no example | Secret used to sign the session cookie. If none is set, one will randomly generated on each startup, meaning all your users will be logged out. |


## Login methods

### Email (local account)

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_EMAIL` | `true` or `false` | set to allow email signin |
| `CMD_ALLOW_EMAIL_REGISTER` | `true` or `false` | set to allow email register (only applied when email is set, default is `true`. Note `bin/manage_users` might help you if registration is `false`.) |


### Dropbox Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_DROPBOX_CLIENTID` | no example | Dropbox API client id |
| `CMD_DROPBOX_CLIENTSECRET` | no example | Dropbox API client secret |


### Facebook Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_FACEBOOK_CLIENTID` | no example | Facebook API client id |
| `CMD_FACEBOOK_CLIENTSECRET` | no example | Facebook API client secret |


### GitHub Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_GITHUB_CLIENTID` | no example | GitHub API client id |
| `CMD_GITHUB_CLIENTSECRET` | no example | GitHub API client secret |


### GitLab Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_GITLAB_SCOPE` | `read_user` or `api` | GitLab API requested scope (default is `api`) (GitLab snippet import/export need `api` scope) |
| `CMD_GITLAB_BASEURL` | no example | GitLab authentication endpoint, set to use other endpoint than GitLab.com (optional) |
| `CMD_GITLAB_CLIENTID` | no example | GitLab API client id |
| `CMD_GITLAB_CLIENTSECRET` | no example | GitLab API client secret |
| `CMD_GITLAB_VERSION` | no example | GitLab API version (v3 or v4) |


### Google Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_GOOGLE_CLIENTID` | no example | Google API client id |
| `CMD_GOOGLE_CLIENTSECRET` | no example | Google API client secret |


### LDAP Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_LDAP_URL` | `ldap://example.com` | URL of LDAP server |
| `CMD_LDAP_BINDDN` | no example | bindDn for LDAP access |
| `CMD_LDAP_BINDCREDENTIALS` | no example | bindCredentials for LDAP access |
| `CMD_LDAP_SEARCHBASE` | `o=users,dc=example,dc=com` | LDAP directory to begin search from |
| `CMD_LDAP_SEARCHFILTER` | `(uid={{username}})` | LDAP filter to search with |
| `CMD_LDAP_SEARCHATTRIBUTES` | `displayName, mail` | LDAP attributes to search with (use comma to separate) |
| `CMD_LDAP_USERIDFIELD` | `uidNumber` or `uid` or `sAMAccountName` | The LDAP field which is used uniquely identify a user on CodiMD |
| `CMD_LDAP_USERNAMEFIELD` | Fallback to userid | The LDAP field which is used as the username on CodiMD |
| `CMD_LDAP_TLS_CA` | `server-cert.pem, root.pem` | Root CA for LDAP TLS in PEM format (use comma to separate) |
| `CMD_LDAP_PROVIDERNAME` | `My institution` | Optional name to be displayed at login form indicating the LDAP provider |


### Mattermost Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_MATTERMOST_BASEURL` | no example | Mattermost authentication endpoint for versions below 5.0. For Mattermost version 5.0 and above, see [guide](guides/auth/mattermost-self-hosted.md). |
| `CMD_MATTERMOST_CLIENTID` | no example | Mattermost API client id |
| `CMD_MATTERMOST_CLIENTSECRET` | no example | Mattermost API client secret |


### OAuth2 Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_OAUTH2_USER_PROFILE_URL` | `https://example.com` | where retrieve information about a user after succesful login. Needs to output JSON. (no default value) Refer to the [Mattermost](guides/auth/mattermost-self-hosted.md) or [Nextcloud](guides/auth/nextcloud.md) examples for more details on all of the `CMD_OAUTH2...` options. |
| `CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR` | `name` | where to find the username in the JSON from the user profile URL. (no default value)|
| `CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR` | `display-name` | where to find the display-name in the JSON from the user profile URL. (no default value) |
| `CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR` | `email` | where to find the email address in the JSON from the user profile URL. (no default value) |
| `CMD_OAUTH2_TOKEN_URL` | `https://example.com` | sometimes called token endpoint, please refer to the documentation of your OAuth2 provider (no default value) |
| `CMD_OAUTH2_AUTHORIZATION_URL` | `https://example.com` | authorization URL of your provider, please refer to the documentation of your OAuth2 provider (no default value) |
| `CMD_OAUTH2_CLIENT_ID` | `afae02fckafd...` | you will get this from your OAuth2 provider when you register CodiMD as OAuth2-client, (no default value) |
| `CMD_OAUTH2_CLIENT_SECRET` | `afae02fckafd...` | you will get this from your OAuth2 provider when you register CodiMD as OAuth2-client, (no default value) |
| `CMD_OAUTH2_PROVIDERNAME` | `My institution` | Optional name to be displayed at login form indicating the oAuth2 provider |


### SAML Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_SAML_IDPSSOURL` | `https://idp.example.com/sso` | authentication endpoint of IdP. for details, see [guide](guides/auth/saml-onelogin.md). |
| `CMD_SAML_IDPCERT` | `/path/to/cert.pem` | certificate file path of IdP in PEM format |
| `CMD_SAML_ISSUER` | no example | identity of the service provider (optional, default: serverurl)" |
| `CMD_SAML_DISABLEREQUESTEDAUTHNCONTEXT` | `true` or `false` | true to allow any authentication method, false restricts to password authentication (PasswordProtectedTransport) method (default: false) |
| `CMD_SAML_IDENTIFIERFORMAT` | no example | name identifier format (optional, default: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`) |
| `CMD_SAML_GROUPATTRIBUTE` | `memberOf` | attribute name for group list (optional) |
| `CMD_SAML_REQUIREDGROUPS` | `codimd-users` | group names that allowed (use vertical bar to separate) (optional) |
| `CMD_SAML_EXTERNALGROUPS` | `Temporary-staff` | group names that not allowed (use vertical bar to separate) (optional) |
| `CMD_SAML_ATTRIBUTE_ID` | `sAMAccountName` | attribute map for `id` (optional, default: NameID of SAML response) |
| `CMD_SAML_ATTRIBUTE_USERNAME` | `mailNickname` | attribute map for `username` (optional, default: NameID of SAML response) |
| `CMD_SAML_ATTRIBUTE_EMAIL` | `mail` | attribute map for `email` (optional, default: NameID of SAML response if `CMD_SAML_IDENTIFIERFORMAT` is default) |


### Twitter Login

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_TWITTER_CONSUMERKEY` | no example | Twitter API consumer key |
| `CMD_TWITTER_CONSUMERSECRET` | no example | Twitter API consumer secret |


## Upload Storage

These are only relevant when they are also configured in sync with their
`CMD_IMAGE_UPLOAD_TYPE`. Also keep in mind, that `filesystem` is available, so
you don't have to use either of these.


### Amazon S3

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_S3_ACCESS_KEY_ID` | no example | AWS access key id |
| `CMD_S3_SECRET_ACCESS_KEY` | no example | AWS secret key |
| `CMD_S3_REGION` | `ap-northeast-1` | AWS S3 region |
| `CMD_S3_BUCKET` | no example | AWS S3 bucket name |


### Azure Blob Storage

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_AZURE_CONNECTION_STRING` | no example | Azure Blob Storage connection string |
| `CMD_AZURE_CONTAINER` | no example | Azure Blob Storage container name (automatically created if non existent) |


### imgur

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_IMGUR_CLIENTID` | no example | Imgur API client id |


### Minio

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_MINIO_ACCESS_KEY` | no example | Minio access key |
| `CMD_MINIO_SECRET_KEY` | no example | Minio secret key |
| `CMD_MINIO_ENDPOINT` | `minio.example.org` | Address of your Minio endpoint/instance |
| `CMD_MINIO_PORT` | `9000` | Port that is used for your Minio instance |
| `CMD_MINIO_SECURE` | `true` | If set to `true` HTTPS is used for Minio |


### Lutim

| variable | example value | description |
| -------- | ------------- | ----------- |
| `CMD_LUTIM_URL` | `https://framapic.org/` |  When `CMD_IMAGE_UPLOAD_TYPE` is set to `lutim`, you can setup the lutim url |

**Note:** *Due to the rename process we renamed all `HMD_`-prefix variables to be `CMD_`-prefixed. The old ones continue to work.*

**Note:** *relative paths are based on CodiMD's base directory*
