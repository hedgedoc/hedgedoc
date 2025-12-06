# Release Checklist:

To copy this checklist please go to [this link](https://github.com/hedgedoc/hedgedoc/blob/master/docs/content/dev/release_checklist.md).

## Preparations:

- [ ] Create release PR(s)
  - [ ] In the main repo (actually only create a local branch to include all the fixes, additions and so on and only push and create a PR after testing)
  - [ ] Release PR in <https://github.com/hedgedoc/container>
  - [ ] Release PR in <https://github.com/hedgedoc/social-media>
- [ ] Security fixes (make sure all available undisclosed security fixes are merged)
- [ ] Bump the version
  - [ ] docs/content/dev/openapi.yml
    - version number image
  - [ ] docs/content/setup/manual-setup.md
    - `git clone` branch
    - `git checkout` branch
  - [ ] package.json
    - `version`
  - [ ] docs/content/setup/docker.md
    - Update docker-compose in the docs
- [ ] Make sure `yarn.lock` is up to date
- [ ] Make sure translations are up to date
  - We use [poeditor_pull](https://github.com/costales/poeditor_pull) to download all language files from POEditor.

  1. change the following line in the script
  ```python
  -      r_lang = requests.post('https://api.poeditor.com/v2/projects/export', dict(api_token=project_api, id=project_id, language=lang['code'], type="po"))
  +      r_lang = requests.post('https://api.poeditor.com/v2/projects/export', dict(api_token=project_api, id=project_id, language=lang['code'], type="key_value_json"))
  ```
  2. run the script.
  3. update the json files in the `locales` directory.
    - any languages with 0% translations should not be included
  4. If any languages are new, they need to be added to `locales/_supported.json`
- [ ] Write release notes (`public/docs/release-notes.md`)
  - [ ] Update date
  - [ ] General description
  - [ ] Things requiring special action beside updating the software
  - [ ] New features
  - [ ] Bug fixes
  - [ ] Enhancements
  - [ ] Add all contributors
    - sort alphabetically
      - [ ] Update `AUTHORS` file

## Final Testing:

- [ ] Create release tar ball
```bash
mkdir /tmp/hedgedoc && cd /tmp/hedgedoc
git clone -b master https://github.com/hedgedoc/hedgedoc.git .
yarn install
yarn build
cd ..
tar cvzf hedgedoc-x.y.z.tar.gz --sort=name --exclude hedgedoc/node_modules --exclude hedgedoc/.git --exclude hedgedoc/.github --exclude hedgedoc/.yarn/cache hedgedoc
```

Use this tar ball to test the following things:

### bin/scripts

- [ ] `bin/setup`
- [ ] `bin/cleanup`
- [ ] `bin/manage_users`
  - [ ] `bin/manage_users --add test@example.com`
  - [ ] `bin/manage_users --reset test@example.com`
  - [ ] `bin/manage_users --del test@example.com`
- [ ] `bin/migrate_from_fs_to_minio`
  1. Clear the uploads directory.
  2. Start HedgeDoc 1 with filesystem uploads and a Postgres DB locally.
  3. Create a new note and upload an image. The image should be now in the uploads directory.
  4. Stop HedgeDoc. Update the config to configure a Minio instance (minio and s3bucket keys in config.json). Ensure the config on the Minio instance is existing (valid access key and secret, bucket existing and empty).
  5. Run `bin/migrate_fs_to_minio`.
  6. Start the HedgeDoc again. The note with the previously uploaded image should now contain the new image URL. The image should load.
  7. Check that the bucket in Minio contains the uploaded image.

### Account system

- [ ] User registration works
- [ ] User login works
- [ ] User self-deletion works

### Notes

- [ ] Create new note works
- [ ] Create new note with custom alias works when FreeURL-mode is enabled
- [ ] Create new note with custom alias fails when FreeURL-mode is disabled
- [ ] New note keeps content (visit, write something, leave, visit again after a minute)
- [ ] API `POST /new` works
  - `curl -i -d '# hello world' -H "Content-Type: text/markdown" http://localhost:3000/new`
- [ ] API `POST /new/some-test-note` works when FreeURL-mode is enabled
- [ ] API `POST /new/some-test-note` fails when FreeURL-mode is disabled
- [ ] Working with 2 (or more) devices on a page works and results in the same document
- [ ] Uploads work for images
- [ ] Uploads fail for other data (e.g. binaries)

### Database

#### Sqlite

- [ ] Sqlite works
- [ ] Keeps content of already existing SQLite file from older version

#### Postgres

- [ ] Postgres works

Run `docker run -d --name=hd1-pg -p 5432:5432 -e POSTGRES_USER=hd1db -e POSTGRES_PASSWORD=hd1db -e POSTGRES_DB=hd1db postgres:latest`
and put this into your config:
```
"db": {
  "username": "hd1db",
  "password": "hd1db",
  "database": "hd1db",
  "host": "localhost",
  "port": "5432",
  "dialect": "postgres"
},
```
#### MariaDB

- [ ] MariaDB works

Run `docker run --name=hd1-mysql -p 3306:3306 -e MARIADB_USER=hd1db --env MARIADB_PASSWORD=hd1db --env MARIADB_DATABASE=hd1db -e MARIADB_RANDOM_ROOT_PASSWORD=true --rm -d mariadb:latest`
and put this into your config:
```
"db": {
  "username": "hd1db",
  "password": "hd1db",
  "database": "hd1db",
  "host": "localhost",
  "port": "3306",
  "dialect": "mariadb"
},
```

### Features page

- [ ] Loading `/features` results in no browser console errors (they may appear for iframed code)
- [ ] Diagrams render without error
- [ ] MathJAX rendering works for inline `$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$`
- [ ] MathJAX rendering works for multi-line (see features page)
- [ ] Codeblocks areas are highlighted and have line numbers in front.

### Table of content (TOC) tests

- [ ] TOC renders in the document as content
- [ ] TOC renders in the lower right corner of the document in `both`-view
- [ ] TOC renders besides the document in the `view`-view
- [ ] TOC renders besides the document in `published`-view
- [ ] Interactive TOC follows the header while scrolling in `both`-view
- [ ] Interactive TOC follows the header while scrolling in `view`-view
- [ ] Interactive TOC follows the header while scrolling in `published`-view

### Embeddings

Click in them an try to play around with them. Don't just check they exist and show up.

- [ ] Youtube embedding works
- [ ] Vimeo embedding works
- [ ] Gist embedding works

### Working YAML-Meta

- [ ] Testing each option if it works

```
---
title: yaml metadata testing
description: This is a test description
tags: features, cool, updated
robots: noindex, nofollow
lang: en-US
dir: rtl
breaks: false
type: slide
slideOptions:
  transition: fade
  theme: white
opengraph:
  title: Special title for OpenGraph protocol
  image: https://dummyimage.com/600x600/000/fff
  image:type: image/png
---
```

### GDPR features

- [ ] Delete account works
- [ ] When account is deleted, verify notes are gone as well
- [ ] Data export works

### Auth

- [ ] SAML
  - config
```
"saml": {
  "idpSsoUrl": "https://auth.hedgedoc.cloud/application/saml/test-hd1/sso/binding/redirect/",
  "idpCert": "/tmp/auth.hedgedoc.cloud.pem",
  "identifierFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
  "attribute": {
    "id": "http://schemas.goauthentik.io/2021/02/saml/uid",
    "username": "http://schemas.goauthentik.io/2021/02/saml/username",
    "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  }
}
```
- [ ] LDAP
  - docker image: `docker run --rm -p 10389:10389 -p 10636:10636 -d ghcr.io/rroemhild/docker-test-openldap:master`
  - config
```
"ldap": {
  "url": "ldap://localhost:10389",
  "bindDn": "cn=admin,dc=planetexpress,dc=com",
  "bindCredentials": "GoodNewsEveryone",
  "searchBase": "ou=people,dc=planetexpress,dc=com",
  "searchFilter": "(&(uid={{username}})(objectClass=inetOrgPerson))",
  "searchAttributes": ["uid", "cn"],
  "usernameField": "cn",
  "useridField": "uid",
  "tlsOptions": {}
}
```
- [ ] OAuth2
```
"oauth2": {
  "baseURL": "https://auth.hedgedoc.cloud/application/o/test-hedgedoc/",
  "userProfileURL": "https://auth.hedgedoc.cloud/application/o/userinfo/",
  "tokenURL": "https://auth.hedgedoc.cloud/application/o/token/",
  "authorizationURL": "https://auth.hedgedoc.cloud/application/o/authorize/",
  "clientID": "REDACTED",
  "clientSecret": "REDACTED",
  "scope": "openid profile user",
  "userProfileUsernameAttr": "preferred_username",
  "userProfileEmailAttr": "email",
  "userProfileDisplayNameAttr": "name",
  "pkce": true
}
```
- [ ] GitHub
- [ ] Rate-limiting for basic user/password (try to login with e.g. test@example.com and invalid password about 10 to 15 times in a row -> you should receive a message "Too many requests" at some point)

### Docker images

You need to clone the [container repo](https://github.com/hedgedoc/container) and use the commands in the root there.

- [ ] debian 

  ```
  docker buildx build -f debian/Dockerfile -t hedgedoc-local:1.x.y-debian . 
  docker run --rm -p 3000:3000 -e CMD_DOMAIN="localhost" -e CMD_URL_ADDPORT=true -e "CMD_DB_URL=sqlite://:memory:" hedgedoc-local:1.x.y-debian
  ```
  The server is then accessable via <http://localhost:3000>. The log should inlcude a line like

  ```
  127.0.0.1 - - [06/Dec/2025:16:17:51 +0000] "GET /_health HTTP/1.1" 200 14 "-" "hedgedoc-container-healthcheck/1.2"
  ```

  You should also check `docker ps` for

  ```
  hedgedoc-local:1.x.y-debian                     "/usr/local/bin/dock…"   29 seconds ago   Up 28 seconds (healthy)
  ```

- [ ] alpine

  ```
  docker buildx build -f alpine/Dockerfile -t hedgedoc-local:1.x.y-alpine . 
  docker run --rm -p 3000:3000 -e CMD_DOMAIN="localhost" -e CMD_URL_ADDPORT=true -e "CMD_DB_URL=sqlite://:memory:" hedgedoc-local:1.x.y-alpine
  ```
  The server is then accessable via http://localhost:3000. The log should inlcude a line like

  ```
  127.0.0.1 - - [06/Dec/2025:16:17:51 +0000] "GET /_health HTTP/1.1" 200 14 "-" "hedgedoc-container-healthcheck/1.2"
  ```

  You should also check `docker ps` for

  ```
  hedgedoc-local:1.x.y-alpine                     "/usr/local/bin/dock…"   29 seconds ago   Up 28 seconds (healthy)
  ```


## Release:

- [ ] Merge Release PR in main repo
- [ ] Tag commit with `git tag 1.x.y` and push it
- [ ] Create release in GitHub and upload tar ball to GitHub
- [ ] Publish Security Advisories (if they exist)
- [ ] Merge Release PR in <https://github.com/hedgedoc/container>
  -  Wait for the images to be available at <https://quay.io/repository/hedgedoc/hedgedoc?tab=tags>
- [ ] Update website by running the ["deploy" workflow](https://github.com/hedgedoc/hedgedoc.github.io/actions?query=workflow%3A%22Deploy+to+github+actions+branch%22) in hedgedoc/hedgedoc.github.io
- [ ] Update docs.hedgedoc.org by running the ["build" workflow](https://github.com/hedgedoc/docs.hedgedoc.org/actions/workflows/build.yml)
- [ ] Merge Release PR in <https://github.com/hedgedoc/social-media>
  - (optional) All people doing the release boost the post 
- [ ] Share the good news in the Matrix-Chatroom 
- [ ] Change this release checklist if necessary
