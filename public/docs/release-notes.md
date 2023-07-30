# Release Notes

## <i class="fa fa-tag"></i> 1.9.9 <i class="fa fa-calendar-o"></i> 2023-07-30

HedgeDoc has a new slogan! See [our announcement](https://community.hedgedoc.org/t/and-the-new-slogan-is/) for the details.

This release fixes a security issue. We recommend upgrading as soon as possible.

### Security Fixes
- [CVE-2023-38487: API allows to hide existing notes](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-7494-7hcf-vxpg)

### Enhancements
- Docker secrets can now be used to provide OAuth2 client secrets ([#4196](https://github.com/hedgedoc/hedgedoc/pull/4196) by [@DennisGaida](https://github.com/DennisGaida))
- Document how to set up Azure Active Directory authentication ([#4413](https://github.com/hedgedoc/hedgedoc/pull/4413) by [@pramitsingh0](https://github.com/pramitsingh0))
- Add YAML metadata to documentation page ([#4371](https://github.com/hedgedoc/hedgedoc/pull/4371) by [@JunedKhan101](https://github.com/JunedKhan101))

### Bugfixes
- Fix non-existing notes being created in some cases, instead of returning a 404 error

### Contributors
- Jordi Mallach (translator)
- sujade (translator)

## <i class="fa fa-tag"></i> 1.9.8 <i class="fa fa-calendar-o"></i> 2023-06-04

**Please note:** This release dropped support for Node 14, which is end-of-life since May 2023.
You now need at least Node 16 to run HedgeDoc. We recommend to use the latest LTS release of Node.js.

This release switches to Yarn 3 for dependency management, as Yarn 1 has bugs preventing us from upgrading some dependencies.
If you install HedgeDoc manually, run `bin/setup` again for instructions. Other installation methods should not require
special actions.

### Enhancements
- Extend boolean environment variable parsing with other positive answers and case insensitivity
- Allow setting of `documentMaxLength` via `CMD_DOCUMENT_MAX_LENGTH` environment variable (contributed by [@jmallach](https://github.com/jmallach))
- Add dedicated healthcheck endpoint at /_health that is less resource intensive than /status
- Compatibility with Node.js 18 and later
- Add support for the arm64 architecture in the docker image
- Add a config option to disable the `/status` and `/metrics` endpoints

### Bugfixes
- Fix that permission errors can break existing connections to a note, causing inconsistent note content and changes not being saved (contributed by [@julianrother](https://github.com/julianrother))
- Fix speaker notes not showing up in the presentation view
- Fix issues with upgrading some dependencies by upgrading to Yarn 3
- Fix macOS compatibility of `bin/setup` script

### Contributors
- UwYFmLpoKtYn (translator)
- Pub (translator)
- SnowCode (translator)

## <i class="fa fa-tag"></i> 1.9.7 <i class="fa fa-calendar-o"></i> 2023-02-19

### Bugfixes
- Fix note titles with special characters producing invalid file names in user export zip file
- Fix night-mode toggle not working when page is loaded with night-mode enabled

### Contributors
- Francesco (translator)
- Gabriel Santiago Macedo (translator)

## <i class="fa fa-tag"></i> 1.9.6 <i class="fa fa-calendar-o"></i> 2022-11-06

### Bugfixes
- Fix migrations deleting all notes when SQLite is used

## <i class="fa fa-tag"></i> 1.9.5 <i class="fa fa-calendar-o"></i> 2022-10-30

### Enhancements
- Add dark mode toggle in mobile view
- Replace embedding shortcode regexes with more specific ones to safeguard against XSS attacks

### Bugfixes
- Fix a crash when using LDAP authentication with custom search attributes (thanks to [@aboettger-tuhh](https://github.com/aboettger-tuhh) for reporting)
- Fix a crash caused by a long note history when the MySQL database is used
- Fix `breaks` option not being respected in the publish-view
- Fix missing syntax highlighting in the markdown editor

### Contributors
- Bateausurleau (translator)
- Goncalo (translator)
- Ívarr Vinter (translator)
- Oein0219 (translator)
- [Pol Dellaiera](https://github.com/drupol)

## <i class="fa fa-tag"></i> 1.9.4 <i class="fa fa-calendar-o"></i> 2022-07-10

**Please note:** This release dropped support for Node 12, which is end-of-life since April 2022.
You now need at least Node 14.13.1 or Node 16 to run HedgeDoc. We don't support more recent versions of Node.

### Enhancements
- Remove unexpected shell call during migrations
- More S3 config options: upload folder & public ACL (thanks to [@lautaroalvarez](https://github.com/lautaroalvarez))

### Contributors
- Al_x (translator)
- Emmanuel Courreges (translator)
- paranic (translator)
- Quentin PAGÈS (translator)

## <i class="fa fa-tag"></i> 1.9.3 <i class="fa fa-calendar-o"></i> 2022-04-10

This release fixes a security issue. We recommend upgrading as soon as possible.

⚠️ **Warning:** If you deploy HedgeDoc and MariaDB with docker-compose using a checkout of our
[container repo](https://github.com/hedgedoc/container), you will need to manually convert the character set
of the database to utf8mb4 when updating. See the [corresponding PR](https://github.com/hedgedoc/container/pull/287) for more information.

### Security Fixes
- Fix [Enumerable upload file names](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-q6vv-2q26-j7rx)

### Enhancements
- Libravatar avatars render as ident-icons when no avatar image was uploaded to Libravatar or Gravatar
- Add database connection error message to log output
- Allow SAML authentication provider to be named
- Suppress error message when `git` binary is not found

### Bugfixes
- Fix error that Libravatar user avatars were not shown when using OAuth2 login
- Fix `bin/manage_users` not accepting numeric passwords (thanks to [@carr0t2](https://github.com/carr0t2) for reporting)
- Fix visibility of modals for screen readers
- Fix GitLab snippet export (thanks to [@semjongeist](https://github.com/semjongeist) for reporting)
- Fix missing inline authorship colors (thanks to [@EBendinelli](https://github.com/EBendinelli) for reporting)

### Contributors
- ced (translator)
- deluxghost (translator)
- [Dennis Gaida](https://github.com/DennisGaida)
- Michael Hauer (translator)
- [Moritz Schlarb](https://github.com/moschlar)
- Mostafa Ahangarha (translator)
- [Sandro](https://github.com/SuperSandro2000)
- Sergio Varela (translator)
- Tạ Quang Khôi (translator)
- Tiago Triques (translator)
- tmpod (translator)
- [Uchiha Kakashi](https://github.com/licy183)


## <i class="fa fa-tag"></i> 1.9.2 <i class="fa fa-calendar-o"></i> 2021-12-03

### Bugfixes
- Fix error in the session handler when requesting `/metrics` or `/status`

## <i class="fa fa-tag"></i> 1.9.1 <i class="fa fa-calendar-o"></i> 2021-12-02

This release increases the minimum required Node versions to `12.20.0`, `14.13.1` and `16`.
In general, only the latest releases of Node 12, 14 and 16 are officially supported by us, older minor versions can be dropped at any time.
We recommend you run HedgeDoc with the latest release of Node 16.

### Bugfixes
- Add workaround for incorrect CSP handling in Safari
- Fix crash when an unexpected response from the GitLab API is encountered
- Fix crash when using hungarian language

### Contributors
- AIAC (translator)
- [Danilo Bargen](https://github.com/dbrgn)
- Diem Duong (translator)
- Gergely Polonkai (translator)
- Nikola (translator)
- [ProttoyChakraborty](https://github.com/ProttoyChakraborty)
- Sergio (translator)
- Tiago Triques (translator)
- Vincent Dusanek (translator)
- Александр (translator)

## <i class="fa fa-tag"></i> 1.9.0 <i class="fa fa-calendar-o"></i> 2021-09-13
### Security Fixes
- [CVE-2021-39175: XSS vector in slide mode speaker-view](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-j748-779h-9697)
- This release removes Google Analytics and Disqus domains from our default Content Security Policy, because they were repeatedly used to exploit security vulnerabilities.  
  If you want to continue using Google Analytics or Disqus, you can re-enable them in the config.
  See [the docs](https://docs.hedgedoc.org/configuration/#web-security-aspects) for details

### Features
- HedgeDoc now automatically retries connecting to the database up to 30 times on startup
- This release introduces the `csp.allowFraming` config option, which controls whether embedding a HedgeDoc instance in other webpages is allowed.
  We **strongly recommend disabling** this option to reduce the risk of XSS attacks
- This release introduces the `csp.allowPDFEmbed` config option, which controls whether embedding PDFs inside HedgeDoc notes is allowed.
  We recommend disabling this option if you don't use the feature, to reduce the attack surface of XSS attacks
- Add additional environment variables to configure the database.
  This allows easier configuration in containerized environments, such as Kubernetes

### Enhancements
- Further improvements to the frontend build process, reducing the initial bundle size by 60%
- Improve the error handling of the `filesystem` upload method
- Improve the error message of failing migrations

### Bugfixes
- Fix crash when trying to read the current Git commit on startup 
- Fix endless loop on shutdown when HedgeDoc can't connect to the database
- Ensure that all cookies are set with the `secure` flag, if HedgeDoc is loaded via HTTPS
- Fix session cookies being created on calls to `/metrics` and `/status`
- Fix incorrect creation of S3 endpoint domain (thanks to [@matejc](https://github.com/matejc))
- Remove CDN support, fixing inconsistencies in library versions delivered to the client
- Fix font display issues when having some variants of fonts used by HedgeDoc installed locally
- Fix links between slides not working
- Fix Vimeo integration using a deprecated API

### Miscellaneous
- Removed MSSQL support, as migrations from 2018 are broken with SQL Server and nobody seems to use it

### Contributors
- Bogdan Cuza (translator)
- Heimen Stoffels (translator)
- igg17 (translator)
- Klorophatu (translator)
- Martin (translator)
- Matija (translator)
- Matthieu Devillers (translator)
- Mindaugas (translator)
- Quentin Pagès (translator)

## <i class="fa fa-tag"></i> 1.8.2 <i class="fa fa-calendar-o"></i> 2021-05-11

This release fixes two security issues. We recommend upgrading as soon as possible.

### Security Fixes
- [CVE-2021-29503: Improper Neutralization of Script-Related HTML Tags in Notes](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-gjg7-4j2h-94fq)
- Fix a potential XSS-vector in the handling of usernames and profile pictures

## <i class="fa fa-tag"></i> 1.8.1 <i class="fa fa-calendar-o"></i> 2021-05-06
### Enhancements
- Speed up `yarn install` in production mode (as performed by `bin/setup`) by marking frontend-only dependencies as dev-dependencies.
  This also reduces the size of the docker container
- Speed up the frontend-build by using `esbuild` instead of `terser` to minify JavaScript
- Improve behavior of the 'Quote', 'List', 'Unordered List' and 'Check List' buttons in the editor to automatically
  apply to the complete first and last line of the selection

### Bugfixes
- Correct the 1.8.0 release notes to state that CVE-2021-29475 has been fixed since HedgeDoc 1.5.0.
- Fix crash on startup when `useSSL` or `csp.upgradeInsecureRequests` is enabled (thanks to [@mdegat01](https://github.com/mdegat01) for reporting)
- Automatically enable `protocolUseSSL` when `useSSL` is also enabled
- Fix the 'Quote', 'List', 'Unordered List' and 'Check List' buttons in the editor to not duplicate content
  when only parts of a line are selected (thanks to [@AnomalRoil](https://github.com/AnomalRoil) for reporting)
- Fix click handler for numbered task lists (thanks to [@xoriade](https://github.com/xoriade) for reporting)


## <i class="fa fa-tag"></i> 1.8.0 <i class="fa fa-calendar-o"></i> 2021-05-03

This release fixes multiple security issues. We recommend upgrading as soon as possible.

**Please note:** This release dropped support for Node 10, which is end-of-life since April 2021. You now need at least Node 12 to run HedgeDoc, but we recommend running [the latest LTS release](https://nodejs.org/en/about/releases/).

### Security Fixes
- [CVE-2021-29474: Relative path traversal Attack on note creation](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-p528-555r-pf87)
- [CVE-2021-21306: Underscore ReDoS](https://github.com/markedjs/marked/security/advisories/GHSA-4r62-v4vq-hr96) in the `marked` library  
  This issue allowed an attacker to hang HedgeDoc by inserting a malicious string into a note. Thanks to Ralph Krimmel for reporting!

We also published an advisory for [CVE-2021-29475: PDF export allows arbitrary file reads](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-pxxg-px9v-6qf3),  
which has already been fixed since HedgeDoc 1.5.0.

### Features
- Database migrations are now automatically applied on application startup  
  The separate `.sequelizerc` configuration file is no longer necessary and can be safely deleted
- A Prometheus-endpoint is now available at `/metrics`, exposing the same stats as `/status`
  in addition to various Node.js performance figures
- Add a config option to require authentication in FreeURL mode ([#755](https://github.com/hedgedoc/hedgedoc/pull/755) by [@nidico](https://github.com/nidico))

### Enhancements
- Removed dependency on external imgur library
- HTML language tags are now set up in a way that stops Google Translate from translating note contents while editing
- Removed `yahoo.com` from the default content security policy
- New translations for Bulgarian, Persian, Galician, Hebrew, Hungarian, Occitan and Brazilian Portuguese  
  Updated translations for Arabic, English, Esperanto, Spanish, Hindi, Japanese, Korean, Polish, Portuguese, Turkish and Traditional Chinese
  Thanks to all translators!
- Various dependency updates

### Bugfixes
- Improve readability of diagrams & embeddings in night-mode
- Use the default template for new notes in FreeURL mode
- Fix frontend-crash in slide-mode if no `slideOptions` are present in the frontmatter
- Return 404 on the `/download` route for non-existent notes in FreeURL mode
- Properly clean up the UNIX socket on application exit
- Don't overwrite existing notes on POST-requests to `/new/<alias>` in FreeURL mode

### Contributors
- Amit Upadhyay (translator)
- Atef Ben Ali (translator)
- Edi Feschiyan (translator)
- Gabriel Santiago Macedo (translator)
- Longyklee (translator)
- Nika. zhenya (translator)
- [Nicolas Dietrich](https://github.com/nidico)
- Nis (translator)
- rogerio-ar-costa (translator)
- sanami (translator)
- Tom Dereszynski (translator)
- 상규 (translator)
- uıʞǝʇuɐϽ (translator)
- UwYFmLpoKtYn (translator)

## <i class="fa fa-tag"></i> 1.7.2 <i class="fa fa-calendar-o"></i> 2021-01-15
This release fixes a security issue. We recommend upgrading as soon as possible.
### Security Fixes
- [CVE-2021-21259: Stored XSS in slide mode](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-44w9-vm8p-3cxw)  
  An attacker can inject arbitrary JavaScript into a HedgeDoc note.

### Bugfixes
- Ensure the last line of the markdown editor is not covered by the status bar (thanks to [@mhdrone](https://github.com/mhdrone) for reporting!)

## <i class="fa fa-tag"></i> 1.7.1 <i class="fa fa-calendar-o"></i> 2020-12-27
This release fixes two security issues. We recommend upgrading as soon as possible.
### Security Fixes
- [CVE-2020-26286: Arbitrary file upload](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-wcr3-xhv7-8gxc)  
  An unauthenticated attacker can upload arbitrary files to the upload storage backend.
- [CVE-2020-26287: Stored XSS in mermaid diagrams](https://github.com/hedgedoc/hedgedoc/security/advisories/GHSA-g6w6-7xf9-m95p)  
  An attacker can inject arbitrary script tags in HedgeDoc notes using mermaid diagrams.


## <i class="fa fa-tag"></i> 1.7.0 <i class="fa fa-calendar-o"></i> 2020-12-21

We have renamed to HedgeDoc!
Many thanks to [Éric Gaspar](https://github.com/ericgaspar/) who designed our new logo!
Have a look at our new website (which also explains the reasoning behind the renaming) at https://hedgedoc.org

This is probably the last release in the 1.x series. Stay tuned for 2.0, scheduled for release next year.

**Please note:** This release dropped support for Node 8, which is end-of-life since January 2020. You now need at least Node 10.13 to run HedgeDoc, but we recommend running [the latest LTS release](https://nodejs.org/en/about/releases/).

**Please note:** If you use a reverse proxy and TLS, make sure it sets the `X-Forwarded-Proto` header correctly,
otherwise you will encounter login-issues.
[Our docs](https://github.com/hedgedoc/hedgedoc/blob/72734690225bb431908b0d4bd8edf38576a95f2f/docs/setup/reverse-proxy.md#reverse-proxy-config) have example configs for common reverse proxies. 

### Enhancements
- Our release tarballs now contain the frontend bundle. This saves users from building the frontend themselves, which was an issue on memory-constrained systems.
- Add OIDC scopes for email & profile retrieval ([#278](https://github.com/hedgedoc/hedgedoc/pull/278) & [#419](https://github.com/hedgedoc/hedgedoc/pull/419) by [@elespike](https://github.com/elespike) & [@vberger](https://github.com/vberger))
- Allow to set a SAML client certificate ([#350](https://github.com/hedgedoc/hedgedoc/pull/350) by [@n0emis](https://github.com/n0emis) & [@em0lar](https://github.com/em0lar))
- Add YunoHost docs ([#431](https://github.com/hedgedoc/hedgedoc/pull/431) by [@ericgaspar](https://github.com/ericgaspar))
- Set OAuth2 `state` parameter ([#407](https://github.com/hedgedoc/hedgedoc/pull/407) & [#541](https://github.com/hedgedoc/hedgedoc/pull/541) by [@dalcde](https://github.com/dalcde) & [@haslersn](https://github.com/haslersn))
- Various documentation improvements (by [@oupala](https://github.com/oupala), [@autra](https://github.com/autra) & [@AdamWorley](https://github.com/AdamWorley))
- Add migration script for minio ([#499](https://github.com/hedgedoc/hedgedoc/pull/499) by [@pierreozoux](https://github.com/pierreozoux))
- Add authorization for OAuth ([#595](https://github.com/hedgedoc/hedgedoc/pull/595) by [@joachimmathes](https://github.com/joachimmathes))
- Improvements to our cookie handling
- Compatibility with Node 14
- Translation updates
- Various dependency updates

### Bugfixes
- Fix compatibility with upper-case MIME-types ([#509](https://github.com/hedgedoc/hedgedoc/pull/509) by [@pierreozoux](https://github.com/pierreozoux))
- Add fix for missing deletion of notes on user-deletion request
- Fix relative path for fetching the style when set 
- Fix broken redirect on login
- CSS fixes for slide mode
- Do not create new notes with `null` as content
- Fix crash when OAuth2 config parameters are missing (thanks to [@vberger](https://github.com/vberger) for reporting!)
- Handle broken `SequelizeMeta` table on MySQL/MariaDB (thanks to [@titulebolide](https://github.com/titulebolide) for reporting!)

### Contributors
- [Adam Worley](https://github.com/AdamWorley)
- andreas koidis (translator)
- [Augustin Trancart](https://github.com/autra)
- Benjamin Bett (translator)
- Butterflyoffire (translator)
- civic john (translator)
- [Daniel Lublin](https://github.com/quite)
- [David Mehren](github.com/davidmehren)
- [david-sawatzke](https://github.com/david-sawatzke)
- deluxghost (translator)
- [Dexter Chua](https://github.com/dalcde)
- Dimitri (translator)
- [em0lar](https://github.com/em0lar)
- [Éric Gaspar](https://github.com/ericgaspar)
- [Erik Michelson](https://github.com/ErikMichelson)
- Giacomo lanza (translator)
- [Girish Ramakrishnan](https://github.com/gramakri)
- Grzegorz (translator)
- [haslersn](https://github.com/haslersn)
- Igor Kerstges (translator)
- Info (translator)
- Jleeothon (translator)
- Johannes Nilsso (translator)
- Jolly Jumper (translator)
- [Jonas Zohren](https://github.com/jfowl)
- Jothish (translator)
- Julien lebranch (translator)
- [Marvin Gaube](https://github.com/margau)
- Mdhm (translator)
- Mostafa Ahangarha (translator)
- [Nick Hahn](https://github.com/codingHahn)
- [Nils van Zuijlen](https://github.com/nils-van-zuijlen)
- Nithin Prabhakaran (translator)
- numéro6 (translator)
- [n0emis](https://github.com/n0emis)
- [oupala](https://github.com/oupala)
- [Philip Molares](https://github.com/DerMolly)
- [Pierre Ozoux](https://github.com/pierreozoux)
- Quentin Pages (translator)
- [Renan Rodrigues](https://github.com/renanqts)
- Renne (translator)
- [Sandro](https://github.com/SuperSandro2000)
- Smaran (translator)
- Sooraj Kenoth (translator)
- themedleb (translator)
- [Tilman Vatteroth](https://github.com/mrdrogdrog)
- Tomasz (translator)
- [Victor Berger](https://github.com/vberger)
- XoseM (translator)
- [Yannick Bungers](https://github.com/InnayTool)
- zgroska (translator)


## <i class="fa fa-tag"></i> 1.6.0 <i class="fa fa-calendar-o"></i> 2020-02-17

### Announcements

- After the 1.6 release we will start to develop Version 2.0, which will introduce breaking changes. But we will take care of making your way to 2.0 easy.
- Since Node version 8 is EOL since January 2020, 1.6 will be the last version with support for Node version 8
- `useCDN` is now `false` by default. This feature is deprecated already and will be removed in 2.0.

### Enhancements

- Add AWS endpoint configuration options
- Add ability to add an imprint using `./public/docs/imprint.md`
- Improve documentation in various sections
- Add ability to create note based on alias in free-url-mode
- Add security note describing the preferred way for responsible disclosures
- Extend forbiddenNoteIds to prevent conflicts with resource directories
- Add OpenGraph metadata support
- Add slovak language
- Add API documentation
- Allow different reference-url styles
- Add automatic focus username field in login modal
- Add ability to limit google-auth to own domain
- Upgrade revealJS to version 3.9.2
- Upgrade mermaid to version 8.4.6
- Update translations (zh-cn, zh-TW, en, de, id, pl, ar, ca, fr, it, sk, sv, ja, nl, pt, ru, es)

### Fixes

- Fix docker secrets support
- Fix sequlize-cli dependency location
- Fix crash in lutim integration
- Fix manage_users CLI handling of non-existing user
- Fix ability to serve CodiMD from different urlpath than `/`
- Fix change from gravatar to libravatar in privacy policy example
- Fix missing browser icons in README

### Refactors

- Refactor note creation handling
- Improve webpack documentation
- Split note actions into own files
- Refactor returnTo handling for auth

### Removals

- Legacy handling of socket.io connections
- Node 8 CI jobs

### Contributors

- [Amolith](https://github.com/Amolith)
- Andrea Rossi (translator)
- CasperS (translator)
- Cpp.create (translator)
- [David Mehren](https://github.com/davidmehren)
- Deluxghost (translator)
- em_crx (translator)
- [Enrico Guiraud](https://github.com/bluehood)
- Epson12332 (translator)
- [Erik Michelson](https://github.com/ErikMichelson)
- Fajar Maulana (translator)
- [Fonata](https://github.com/Fonata)
- [foobarable](https://github.com/foobarable)
- [Girish Ramakrishnan](https://github.com/gramakri)
- Grzegorz (translator)
- [hoijui](https://github.com/hoijui)
- [Ian Tsai](https://github.com/b10102016)
- id7xyz (translator)
- [ike](https://github.com/ikewat)
- Info (translator)
- Javier Leandro (translator)
- [Jonas Thelemann](https://github.com/dargmuesli)
- [Jonas Zohren](https://github.com/jfowl)
- kazutomo.waragai (translator)
- [MartinT](https://github.com/MartinTuroci)
- [Mathias Merscher](https://github.com/madddi)
- [Matthias Lindinger](https://github.com/morpheus-87)
- Mdhm (translator)
- Me (translator)
- mondstern (translator)
- Patrick (translator)
- Rafael Gauna Trindade (translator)
- Ramon van Biljouw (translator)
- [RyotaK](https://github.com/Ry0taK)
- [Sandro](https://github.com/SuperSandro2000)
- [Sören Wegener](https://github.com/soerface)
- [Stefan Peters](https://github.com/stefandesu)
- [Yukai Huang](https://github.com/Yukaii)

## <i class="fa fa-tag"></i> 1.5.0 <i class="fa fa-clock-o"></i> 2019-08-15 00:00

### Announcements

- There is a new docker image available by LinuxServer.io providing an ARM container
- Disabling PDF export due to security problems

### Enhancements

- Add migration guide for Node version 6
- Add functionality to respect Do-Not-Track header
- Add Arabian translation

### Fixes

- Fix styling in slide preview
- Fix some lint warning
- Upgrade Sequelize to version 5
- Add Linuxserver.io setup instructions for CodiMD
- Update translations for DE, SV, ID
- Add ability to upload SVGs
- Add `dbURL`config as docker secret
- Upgrade meta-marked - Fixes DOS capability in CodiMD (<https://github.com/codimd/server/commit/ba6a24a673c24db25969de2a59b9341247f3f722>)
- Fix variable names in docker secrets config library

### Refactors

- Refactor debug logging in various places

### Deprecations

- `useCDN` will be deprecated and will disappear in favor of locally served resources. (<https://community.codimd.org/t/poll-on-cdn-usage/28>)

### Contributors

- [Amolith](https://github.com/Amolith) (social media)
- Aro Row (translator)
- bitinerant (security)
- Butterflyoffire (translator)
- [Claudius Coenen (ccoenen)](https://github.com/ccoenen)
- Erik (translator)
- Fajar Maulana (translator)
- id7xyz (translator)
- joohoi (security)
- [Jonas Thelemann (dargmuesli)](https://github.com/dargmuesli)
- [Lennart Weller (lhw)](https://github.com/lhw)
- [chbmb](https://github.com/CHBMB)
- [Raccoon (a60814billy)](https://github.com/a60814billy)
- RS232 (translator)
- [Toma Tasovac (ttasovac)](https://github.com/ttasovac)

## <i class="fa fa-tag"></i> 1.4.0 <i class="fa fa-clock-o"></i> 2019-05-31 00:00

### Announcements

- CodiMD now has a [Mastodon account](https://social.codimd.org/mastodon)
- CodiMD now has a [community forum](https://community.codimd.org)
- With CodiMD 1.4.0 we're dropping node 6 support. That version of node.js is discontinued and no longer receives any security updates. We would like to encourage you to upgrade node 8 or later. Node 8 will continue to be supported at least until its end-of-life in January 2020.

### Enhancements

- Use libravatar instead of Gravatar
- Fix language description capitalization
- Move upload button into the toolbar
- Clean up Heroku configurations
- Add new screenshot to README and index page
- Add link to community call to README
- Update languages (pl, sr, zh-CN, fr, it, ja, zh-TW, de, sv, es)
- Change edit link to `both` view
- Hide minio default ports
- Add missing passport-saml configuration
- Add lutim support
- Update dependencies
- Add documentation for keycloak
- Add tests for user model
- Add Mastodon link
- Add config for toobusy middleware
- Add vietnamese language

### Fixes

- Fix missing space in footer
- Fix various possible security vulnerabilities in dependencies
- Fix broken dependency js-sequence-diagrams
- Fix XSS in graphviz error message rendering
- Fix toolbar night mode
- Fix hidden header on scroll
- Fix missing pictures for OpenID
- Fix statusbar hiding text in edit view

### Refactors

- Refactor README and documentation
- Integrate the old wiki into documentation section
- Refactor headers on Features page
- Replace js-url with wurl
- Refactor scrypt integration

### Removals

- Remove sass-loader

### Contributors

- [Amolith](https://github.com/Amolith)
- CasperS (translator)
- Cedric.couralet (translator)
- [Claudius Coenen (ccoenen)](https://github.com/ccoenen)
- Daniel (translator)
- Deluxghost (translator)
- [Dylan Dervaux (Dylanderv)](https://github.com/Dylanderv)
- [Emmanuel Ormancey (nopap)](https://github.com/nopap)
- Grzegorz (translator)
- [Henrik Hüttemann (HerHde)](https://github.com/HerHde)
- Hồng (translator)
- [Mauricio Robayo (archemiro)](https://github.com/archemiro)
- [Max Wu (jackycute)](https://github.com/jackycute)
- [naimo](https://github.com/naimo)
- [Pedro Ferreira (pferreir)](https://github.com/pferreir)
- [Simon Fish (boardfish)](https://github.com/boardfish)
- [Stéphane Guillou (stragu)](https://github.com/stragu)
- Sylke Vicious (translator)
- [Thor77](https://github.com/Thor77)
- veracosta (translator)
- Vladan (translator)
- War (translator)
- Zhai233 (translator)

## <i class="fa fa-tag"></i> 1.3.2 <i class="fa fa-clock-o"></i> 2019-03-28 00:00

### Announcement

- CodiMD is now running in an own organization. [Check out our vision for the future](https://github.com/codimd/server/issues/10)

### Fixes

- Update various links to the new repositories
- Fix background color for mode switching button in night mode

## <i class="fa fa-tag"></i> 1.3.1 <i class="fa fa-clock-o"></i> 2019-03-23 00:00

### Enhancements

- Add some missing translations
- Add Serbian language

### Fixes

- Fix broken redirect for empty `serverURL`
- Fix wrong variable type for HSTS maxAge
- Fix GitLab snippets showing up without being configured
- Fix Google's API after disabling Google+
- Fix broken PDF export

### Contributors

- atachibana (translator)
- [Aurélien JANVIER](https://github.com/ajanvier) (translator)
- [Daan Sprenkels](https://github.com/dsprenkels) (translator)
- Farizrizaldy (translator)
- [Luclu7](https://github.com/Luclu7)
- Sylke Vicious (translator)
- [toshi0123](https://github.com/toshi0123) & okochi-toshiki
- [Turakar](https://github.com/Turakar)
- [Vladan](https://github.com/cvladan) (translator)

## <i class="fa fa-tag"></i> 1.3.0 <i class="fa fa-clock-o"></i> 2019-03-03 00:00

### Enhancements

- Run db migrations on `npm start`
- Add documentation about integration with AD LDAP
- Add `rel="noopener"` to all links
- Add documentation about integration with Nextcloud for authentication
- Update URL on frontpage to point to codimd.org
- Replace Fontawesome with Forkawesome
- Add OpenID support
- Add print icon to slide view
- Add auto-complete for language names that are highlighted in codeblocks
- Improve translations for Chinese, Dutch, French, German, Italien, Korean, Polish, and Russian language
- Add Download action to published document API
- Add reset password feature to `manage_users` script
- Move from own `./tmp` directory to system temp directory
- Add Etherpad migration guide
- Move XSS library to a more native position
- Use full version string to determine changes from the backend
- Update winston (logging library)
- Use slide preview in slide example
- Improve migration handling
- Update reveal.js to version 3.7.0
- Replace scrypt library with its successor
- Replace `to-markdown` with `turndown` (successor library)
- Update socket.io
- Add warning on missing base URL
- Update bootstrap to version 3.4.0
- Update handlebar

### Fixes

- Fix paths in GitLab documentation
- Fix missing `data:` URL in CSP
- Fix oAuth2 name/label field
- Fix GitLab API integration
- Fix auto-completed but not rendered emojis
- Fix menu organization depending on enabled services
- Fix some logging in the OT module
- Fix some unhandled internalOAuthError exception
- Fix unwanted creation of robots.txt document in "freeurl-mode"
- Fix some links on index page to lead to the right sections on feature page
- Fix document breaking, empty headlines
- Fix wrong multiplication for HSTS header seconds
- Fix wrong subdirectories in exported user data
- Fix CSP for speaker notes
- Fix CSP for disqus
- Fix URL API usage
- Fix Gist embedding
- Fix upload provider error message
- Fix unescaped disqus user names
- Fix SAML vulnerability
- Fix link to SAML guide
- Fix deep dependency problem with node 6.x
- Fix broken PDF export by wrong unlink call
- Fix possible XSS attack in MathJax

### Refactors

- Refactor to use `ws` instead of the the no longer supported `uws`
- Refactor frontend build system to use webpack version 4
- Refactor file path configuration (views, uploads, …)
- Refactor `manage_users` script
- Refactor handling of template variables
- Refactor linting to use eslint

### Removals

- Remove no longer working Octicons
- Remove links to our old Gitter channel
- Remove unused library node-uuid
- Remove unneeded blueimp-md5 dependency
- Remove speakerdeck due to broken implementation

### Contributors

- Adam.emts (translator)
- [Alex Garcia](https://github.com/asg017)
- [Cédric Couralet (micedre)](https://github.com/micedre)
- [Claudius Coenen](https://github.com/ccoenen)
- [Daan Sprenkels](https://github.com/dsprenkels)
- [David Mehren](https://github.com/davidmehren)
- [Erona](https://github.com/Eronana)
- [Felix Yan](https://github.com/felixonmars)
- [Jonathan](https://github.com/phrix32)
- Jong-kai Yang (translator)
- [MartB](https://github.com/MartB)
- [Max Wu (jackycute)](https://github.com/jackycute)
- [mcnesium](https://github.com/mcnesium)
- Nullnine (translator)
- RanoIP (translator)
- [SuNbiT](https://github.com/sunbit)
- Sylke Vicious (translator)
- Timothee (translator)
- [WilliButz](https://github.com/WilliButz)
- [Xaver Maierhofer](https://github.com/xf-)
- [云屿](https://github.com/cloudyu)

## <i class="fa fa-tag"></i> 1.2.1 <i class="fa fa-clock-o"></i> 2018-09-26 00:00

### Enhancements

- Update Italian translations
- Update Japanese translations
- Update markdown-pdf
- Add support for unix sockets
- Update "follow us" information to Community channel and translation
- Add Cloudron installation method
- Add guide for Mattermost authentication
- Update various packages
- Add Indonesian language as new translation

### Fixes

- Fix content types in status router
- Fix some modal colors in night mode
- Fix CSP to allow usage of speaker notes
- Fix some wrong title attributes in the editor toolbar
- Fix some confusion about the default location of images. It's always the local filesystem now
- Fix object handling in avatar generation code
- Finally fix error handling of LZ-String by using self-maintained version
- Fix migration handling
- Fix gitlab API version
- Fix some server crashes caused by PDF creation
- Fix document length limit on post to `/new`
- Fix broken youtube embedding on `/features` page

### Refactors

- Refactor generation of table of contents
- Refactor "copyright"-section to be a "Powered by"

### Removes

- Remove unneeded inline styling

### Deprecations

- NodeJS version 6
- Mattermost login integration (is replaced by [generic oAuth2 module](https://github.com/codimd/server/blob/6ce7b20a7f92ccff2f7f870ff5d116d685310cfd/docs/guides/auth/mattermost-self-hosted.md))

### Honorable mentions

- [Alex Hesse (Pingu501)](https://github.com/Pingu501)
- [Alexander Wellbrock (w4tsn)](https://github.com/w4tsn)
- [Cédric Couralet (micedre)](https://github.com/micedre)
- [Girish Ramakrishnan (gramakri)](https://github.com/gramakri)
- [maahl](https://github.com/maahl)
- [Max Wu (jackycute)](https://github.com/jackycute)
- [Miranda (ahihi)](https://github.com/ahihi)
- [Ondřej Slabý (maxer456)](https://github.com/maxer456)

## <i class="fa fa-tag"></i> 1.2.0 <i class="fa fa-clock-o"></i> 2018-06-28 00:00

### Announcement

- HackMD CE is renamed to CodiMD to prevent confusion. [For details see here](https://github.com/codimd/server/tree/master/docs/history.md)

### Enhancements

- Show full title by hovering over to table of contents entries
- Add generic OAUTH2 support for authentication
- Redirect unauthenticated user to login page on "forbidden" pages
- Add ability to add ToS and privacy documents without code changes
- Add account deletion as part of user self-management
- Add download of all own notes
- Add privacy policy example (no legal advice)
- Increase checkbox size on slides
- Add support for Azure blob storage for image uploads
- Add Korean translation
- Add note about official K8s chart for deployment
- Add toolbar for markdown shortcuts in editor
- Add ability to disable Gravatar integration
- Add print icon to slide menu which leads to the print view.
- Add sequelize to setup instructions
- Update various packages

### Fixes

- Fix local writes for non-existing translations in production
- Fix wrong documentation about default image upload type
- Fix possible error if CodiMD is started with wrong working directory
- Fix issues caused by cached/cacheeable client config
- Fix issues caused by notes created via curl/API with CRLF line endings
- Fix broken images for downloaded PDFs while using `filesystem` as `imageUploadType`
- Fix Unicode URLs when using `allowFreeURL=true`

### Refactors

- Split auth documentation into multiple documents

### Removes

- Remove polyfill for `useCDN=false` setups
- Remove unused and no longer needed symlink from translations

### Honorable mentions

- [Adam Hoka (ahoka)](https://github.com/ahoka)
- [Edgar Z. Alvarenga (aivuk)](https://github.com/aivuk)
- [Jacob Burden (jekrb)](https://github.com/jekrb)
- [Pedro Ferreira (pferreir)](https://github.com/pferreir)
- [TC Liu (liuderchi)](https://github.com/liuderchi)

## <i class="fa fa-tag"></i> 1.1.1-ce <i class="fa fa-clock-o"></i> 2018-05-23 12:00

### Security

- Fix Google Drive integration leaked `clientSecret` for Google integration
- Update base64url package

### Fixes

- Fix typos in integrations
- Fix high need of file descriptors during build
- Fix heroku deployment by limiting node version to <10.x

### Refactors

- Refactor letterAvatars to be compliant with CSP

### Removes

- Google Drive integration

### Honorable mentions

- [Max Wu (jackycute)](https://github.com/jackycute)

## <i class="fa fa-tag"></i> 1.1.0-ce <i class="fa fa-clock-o"></i> 2018-04-06 12:00

### Security

- Adding CSP headers
- Prevent data-leak by wrong LDAP config
- Generate dynamic `sessionSecret` if none is specified

### Enhancements

- Add Minio support
- Allow posting content to new notes by API
- Add anonymous edit function in restricted mode
- Add support for more Mimetypes on S3, Minio and local filesystem uploads
- Add basic CLI tooling for local user management
- Add referrer policy
- Add more usable HTML5 tags
- Add `useridField` in LDAP config
- Add option for ReportURI for CSP violations
- Add persistance for night mode
- Allow setting of `sessionSecret` by environment variable
- Add night mode to features page
- Add Riot / Matrix - Community link to help page

### Fixes

- Fix ToDo-toggle function
- Fix LDAP provider name in front-end
- Fix errors on authenticated sessions for deleted users
- Fix typo in database migration
- Fix possible data truncation of authorship
- Minor fixes in README.md
- Allow usage of ESC-key by codemirror
- Fix array of emails in LDAP
- Fix type errors by environment configs
- Fix error message on some file API errors
- Fix minor CSS issues in night mode

### Refactors

- Refactor contact
- Refactor social media integration on main page
- Refactor socket.io code to no longer use referrer
- Refactor webpack config to need less dependencies in package.json
- Refactor imageRouter for modularity
- Refactor configs to be camel case

### Removes

- Remove unused `tokenSecret` from LDAP config

### Deprecations

- All non-camelcase config

### Honorable mentions

- [Dario Ernst (Nebukadneza)](https://github.com/Nebukadneza)
- [David Mehren (davidmehren)](https://github.com/davidmehren)
- [Dustin Frisch (fooker)](https://github.com/fooker)
- [Felix Schäfer (thegcat)](https://github.com/thegcat)
- [Literallie (xxyy)](https://github.com/xxyy)
- [Marc Deop (marcdeop)](https://github.com/marcdeop)
- [Max Wu (jackycute)](https://github.com/jackycute)
- [Robin Naundorf (senk)](https://github.com/senk)
- [Stefan Bühler (stbuehler)](https://github.com/stbuehler)
- [Takeaki Matsumoto (takmatsu)](https://github.com/takmatsu)
- [Tang TsungYi (vazontang)](https://github.com/vazontang)
- [Zearin (Zearin)](https://github.com/Zearin)

## <i class="fa fa-tag"></i> 1.0.1-ce <i class="fa fa-clock-o"></i> 2018-01-19 15:00

### Security

- Fix Dropbox client secret leak

### Enhancements

- Improve version handling
- It's 2018!

### Fixes

- Fix image alt-tag rendering
- Fix Dropbox appkey

## <i class="fa fa-tag"></i> 1.0.0-ce <i class="fa fa-clock-o"></i> 2018-01-18 12:00

### License

- Switch from MIT to AGPL

### Enhancements

- Improve language support
- Allow themes for reveal
- Add dark theme for editor and view
- Add danish translation
- Add simplified chinese translation
- Provide new permission table
- Make HSTS configurable
- Make PDF export configurable
- Add Mattermost auth support
- Add SAML support

### Fixes

- Fix regex for speaker notes
- Fix S3 endpoint support
- Fix German translation
- Fix English translation
- Fix broken profile images
- Fix XSS attacks
- Fix history order
- Fix missing boolean settings
- Fix LDAP auth
- Fix too long notes droping content
- Fix mermaid compatiblity with new version
- Fix SSL CA path parsing

### Refactors

- Refactor main page
- Refactor status pages
- Refactor config handling
- Refactor auth backend
- Refactor code styling
- Refactor middleware to modules

## <i class="fa fa-tag"></i> 0.5.1 `Doppio` <i class="fa fa-clock-o"></i> 2017-03-23 00:20

### Enhancements

- Update to indicate version in status API header
- Update to generate front-end constants on server startup
- Update to add gitlab api scope option and auto adapt gitlab snippet feature on it
- Update to add default permission config option
- Update to add basics for secret management by Docker 1.13
- Update webpack config to use parallel uglify plugin to speed up production build
- Update realtime to use timer to avoid memory leaks on busy tick
- Update to remove history cache to lower application coupling
- Update to add screenshot on index page
- Update index layout to add profile on navbar
- Update to support allow email register option
- Update to support disable anonymous view option
- Update to add limited and protected permission
- Update to allow displaying LDAP provider name on sign-in modal
- Update to show yaml-metadata and diagram parsing error in the view

### Fixes

- Fix XSS vulnerability in link regex [Security Issue]
- Fix todo list item class might add in wrong element
- Fix pagination error in list.js over v1.5.0
- Fix update doc from filesystem cause redundant authorship stringify
- Fix export html to replace fallen cdn tortue.me to cdnjs
- Fix rendering might result XSS attribute on self closing tag [Security Issue]
- Fix out of sync when deleting on same cursor position on several clients
- Fix not determine OT have pending operations properly
- Fix to keep selections on save and restore info
- Fix image path problem when using filesystem backend
- Fix meta error not clear on before rendering
- Fix duplicated headers anchor link not been updated properly
- Fix checkLoginStateChanged might fall into infinite loop while calling loginStateChangeEvent
- Fix to workaround text shadow for font antialias might cause cut off in Edge
- Fix and refactor extracting content using metaMarked directly might lead in invalid object

### Refactors

- Refactor editor related code
- Refactor code with JavaScript Standard Style
- Refactor templates, partials and rearrange its path
- Refactor front-end code with more modular concepts
- Refactor front-end code using ES6 (also unify configs to `config.json`)

### Removes

- Removed UTF-8 BOM in download function

## <i class="fa fa-tag"></i> 0.5.0 `Ristretto` <i class="fa fa-clock-o"></i> 2017-01-02 02:35

### Enhancements

- Update year to 2017 (Happy New Year!)
- Update to improve editor performance by debounce checkEditorScrollbar event
- Refactor data processing to model definition
- Update to remove null byte on editor changes
- Update to remove null byte before saving to DB
- Update to support Esperanto locale
- Little improvements (typos, uppercase + accents, better case) for French locale
- Update features.md publish button name and icon

### Fixes

- Fix authorship might losing update event because of throttling
- Fix migration script of revision lacks of definition of primary key
- Fix to not use diff_cleanupSemantic
- Fix URL concatenation when uploading images to local filesystem
- Fix js-url not import correctly
- Fixed typo: anonmyous
- Fix codemirror spell checker not considering abbreviation which contain apostrophe in word
- Fix possible user is undefined in realtime events
- Fix wrong package name reference in webpack config for bootstrap-validator
- Fix email option in config not parse correctly
- Fix mathjax not able to render issue

### Removes

- Remove LZString compression for data storage
- Remove LZString compression for some socket.io event data

## <i class="fa fa-tag"></i> 0.4.6 `Melya` <i class="fa fa-clock-o"></i> 2016-12-19 17:20

### Features

- Add support of allow free url config option
- Add support of allow anonymous config option
- Add preferences to editor status bar and add allow override browser keymap option
- Add support of s3 and local filesystem for image uploading
- Add of support optional email register and signin
- Use uWebSocket to improve websocket performance
- Use CDNJS by default with https and SRI support
- Use Webpack to bundle frontend code

### Enhancements

- Update to make TOC syntax be case-insensitive
- Update to handle request with invalid uri
- Update to auto generate meta description based on content in publish note and slide
- Update to support haskell, go, typescript and jsx syntax highlighting in code block
- Update to use workers to leverage intensive work loading
- Update to support summary tag
- Change use cdn config option default to be true
- Update to retry when anytime the socket io disconnect
- Change to raise socket io timeout, heartbeat interval and timeout to lower offline period
- Update emoji parser using markdown-it-emoji instead of emojify
- Optimize finishView selector performance by avoid universal selector
- Config heroku deployment
- Update to support Hindi, Swedish locale
- Update to support wrap syntax for code block
- Update to support pagination for history list

### Fixes

- Fix slide mode on print pdf not finish view rendering
- Fix when server have heavy loading cache might not update to db properly
- Fix redirection to url without trailing slashes not considering about config urlpath
- Fix header id and text might affects by mathjax tags
- Fix possible meta XSS in history list [Security Issue]
- Fix possible XSS in yaml-metadata and turn using ejs escape syntax than external lib [Security Issue]
- Fix to allow data attribute of section tag in slide
- Fix slide might able to add unsafe attribute on section tag which cause XSS [Security Issue]
- Fix slide might trigger script when processing markdown which cause XSS [Security Issue]
- Fix published note won't scroll to hash on load
- Fix mathjax with blockquote might have race condition
- Fix server reconnect might not resend pending operations
- Fix slide export pdf styles not applied issue
- Fix possible unclose HTML and leaked html tags when fail to parse diagrams
- Fix typos in the `slide-example.md`
- Fix socket io doc event should setDoc when revision mismatch and no outstanding operation
- Fix markdown styles conflicting bootstrap on p and ul under alert area
- Fix finishView mermaid might select and replace whole markdown-body issue
- Fix code block which in deeper level will not be parsed issue
- Fix code block highlighting html not escaped when no languages specified
- Fix client socket on delete event might not delete corresponding history record correctly
- Fix to handle name or color is undefined error
- Fix history item event not bind properly on pagination change
- Fix history time should save in UNIX timestamp to avoid time offset issue

### Removes

- Drop bower the package manager
- Remove auto linkify image

## <i class="fa fa-tag"></i> 0.4.5 `latte` <i class="fa fa-clock-o"></i> 2016-10-11 01:22

### Features

- Add more environment variables for server configuration
- Add setup script for getting started
- Add support of deleting note
- Add support of shortcut keys which can add and remove symbol surround text
- Add support of shortcut keys for changing mode
- Add support of i18n (English, Chinese, French, German, Japanese, Spanish, Portuguese, Greek, Italian, Turkish, Russian, Dutch, Croatian, Polish, Ukrainian)
- Add support of note info API
- Add support of disqus via yaml-metadata

### Enhancements

- Optimize png images by using zopflipng
- Update CodeMirror to 5.19.0 and rename jade to pug
- Update to add cache to history and improve its performance
- Update default indent to use spaces instead of tabs
- Improve syntax highlighting performance
- Update to make client handle syncing error better, use delay to avoid wrong document revision
- Update to allow CORS as API on revision actions
- Update to support showing owner on the infobar
- Update to prevent duplicate client push in queue to lower down server loading
- Reduce update view debounce time to make preview refresh quicker
- Update help modal cheatsheet font styles to make it more clear on spaces
- Update to add revision saving policy
- Update to support tiddlywiki and mediawiki syntax highlighting in editor
- Update to support save mode to url and vise versa
- Update edit and publish icon and change toggle icon for UX  
- Improve authorship markers update performance
- Update slide mode to show extra info and support url actions
- Change the last change user saving strategy
- Update to support data uri in src attribute of image tag
- Improve index layout and UX with UI adjustments
- Update XSS policy to allow iframe and link with custom protocol
- Update markdown styles to follow github latest layout styles
- Update slide mode, now respect all meta settings and update default styles
- Update to make ToC menu always accessible without scrolling
- Update to make doc only update while filesystem content not match db content

### Fixes

- Fix README and features document format and grammar issues
- Fix some potential memory leaks bugs
- Fix history storage might not fallback correctly
- Fix to make mathjax expression display in editor correctly (not italic)
- Fix note title might have unstriped html tags
- Fix client reconnect should resend last operation
- Fix a bug when setting both maxAge and expires may cause user can't signin
- Fix text complete extra tags for blockquote and referrals
- Fix bug that when window close will make ajax fail and cause cookies set to wrong state
- Fix markdown render might fall into regex infinite loop
- Fix syntax error caused by element contain special characters
- Fix reference error caused by some scripts loading order
- Fix ToC id naming to avoid possible overlap with user ToC
- Fix header nav bar rwd detect element should use div tag or it might glitch the layout
- Fix textcomplete of extra tags for blockquote not match space character in the between
- Fix text-shadow for text antialiased might cause IE or Edge text cutoff

### Removes

- Cancel updating history on page unload

## <i class="fa fa-tag"></i> 0.4.4 `mocha` <i class="fa fa-clock-o"></i> 2016-08-02 17:10

### Features

- Add support of showing authorship in editor
- Add support of saving authorship
- Add support of saving authors
- Add support of slide preview in both mode
- Add support of all extra syntax in slide mode

### Enhancements

- Update realtime check and refresh event, compress data to minimize network transfer delay
- Update to keep showing second level TOC if there is only one first level TOC
- Update to add expand and collapse toggle for TOC
- Update to make help modal and text complete hint using consistent reminder text
- Update to support slideOptions in the yaml metadata for customize slides
- Update to support redirect back to previous url after signin
- Update to avoid duplicated rendering slides and reduce DOM wrap
- Update CodeMirror to version 5.17.1
- Update to make random color more discrete
- Update user icon styles to make avatar more obvious
- Update Bootstrap to 3.3.7 and jQuery to 3.1.0 with related patches
- Update spell checker to ignore non-english or numeric alphabets
- Update to auto rolling session for auto extending cookies expiration
- Update some menu items and UIs
- Update to reduce realtime timeout and heartbeat interval to handle stale clients quicker
- Update to force note, publish note, publish slide redirect to their expected url
- Update to change server pre-rendering engine to markdown-it

### Fixes

- Workaround vim mode might overwrite copy keyMap on Windows
- Fix TOC might not update after changeMode
- Workaround slide mode gets glitch and blurry text on Firefox 47+
- Fix idle.js not change isAway property on onAway and onAwayBack events
- Fix http body request entity too large issue
- Fix google-diff-match-patch encodeURI exception issue
- Fix yaml metadata title should pass to generateWebTitle
- Fix spellcheck settings from cookies might not a boolean in string type
- Fix cookies might not in boolean type cause page refresh loop
- Fix the signin and logout redirect url might be empty
- Fix realtime might not clear or remove invalid sockets in queue
- Fix slide not refresh layout on ajax item loaded
- Fix retryOnDisconnect not clean up after reconnected
- Fix some potential memory leaks

## <i class="fa fa-tag"></i> 0.4.3 `espresso` <i class="fa fa-clock-o"></i> 2016-06-28 02:04

### Features

- Add support of spellcheck
- Add support of light editor theme
- Add support of embed pdf
- Add support of exporting raw html
- Add revision modal with UIs and support marking patch diff texts
- Add support of saving note revision

### Enhancements

- Update to extend login info cookies to 365 days to reduce reductant page refresh
- Update to support new metadata: title, description, tags and google-analytics
- Prevent crawling editing note to enhance privacy
- Update to remove all data lines attributes to gain better update performance
- Update refresh modal to show more detail informations
- Update to make cursor tag default as hover mode to prevent tag overlay other lines
- Update highlight.js to version 9.4.0 and use bower dependency
- Improve history performance

### Fixes

- Fix history filter tags and search keyword might not apply after refresh
- Fix part class in list item might infect buildMap process
- Fix pdf tmp path is missing a folder slash before timestamp
- Fix realtime connection get stock when lots of client try to connect at same moment
- Fix locked or private permission should block any operation if owner is null
- Add back missing support of image size syntax in 0.4.2
- Fix update permission might cause duplicate view rendering
- Fix on paste long document to editor might cause scroll not syncing
- Workaround CodeMirror won't draw selections outside of the viewport
- Fix to make socket keep retry after disconnect on server maintenance

### Removes

- Remove metadata spellcheck support
- Remove robot meta on note edit page and html template

## <i class="fa fa-tag"></i> 0.4.2 `cappuccino` <i class="fa fa-clock-o"></i> 2016-04-22 10:43

### Features

- Support sync scrolling to edit area
- Support import and export with GitLab snippet
- Support GitLab signin
- Add cheatsheet and help modal

### Enhancements

- Upgrade CodeMirror to version 5.15.3
- Support maintenance mode and gracefully exit process on signal
- Update to update doc in db when doc in filesystem have newer modified time
- Update to replace animation acceleration library from gsap to velocity
- Support image syntax with size
- Update textcomplete rules to support more conditions
- Update to use bigger user profile image
- Support showing signin button only when needed

### Fixes

- Fix other clients' cursor might disappear or move out of bound
- Fix to handle user profile image not exists
- Fix potential toolbar layout glitch
- Fix imgur uploads should always use https to avoid mix-content warning
- Fix to change fullscreen key to avoid OS key conflicts
- Fix and change ESC key in Vim mode

## <i class="fa fa-tag"></i> 0.4.1 <i class="fa fa-clock-o"></i> 2016-04-22 10:43

### Enhancements

- Support when client domain not provided will use window.location variable
- Support when domain not provided will use relative path
- Support DOMAIN and URL_PATH environment variables

## <i class="fa fa-tag"></i> 0.4.0 `first-year` <i class="fa fa-clock-o"></i> 2016-04-20 14:30

### Features

- Support docs
- Support Ionicons and Octicons
- Support mermaid diagram
- Support import and export with Gist
- Support import and export with Google Drive
- Support more options in YAML metadata
- Support change keymap and indentation size/type

### Enhancements

- Change header anchor styles
- Refactor server code and configs
- Support experimental spell checking
- Upgrade CodeMirror to 5.13.5
- Update to emit info and disconnect clients if updater get errors
- Support to indicate if the note status is created or updated
- Support more DB types
- Server now use ORM for DBs
- Support static file cache
- Support more ssl settings
- Improve server stablilty
- Improve server performance
- Support Ionicons
- Support container syntax and styles
- Improve input performance
- Change markdown engine from remarkable to markdown-it
- Server now support set sub url path
- Support textcomplete in multiple editing
- Update to filter XSS on rendering
- Update to make sync scroll lerp on last line
- Update to make continue list in todo list default as unchecked
- Support auto indent whole line in list or blockquote

### Fixes

- Fix status bar might be inserted before loaded
- Fix mobile layout and focus issues
- Fix editor layout and styles might not handle correctly
- Fix all diagram rendering method and styles to avoid partial update gets wrong
- Fix to ignore process image which already wrapped by link node
- Fix when cut or patse scroll map might get wrong
- Fix to handle more socket error and info status
- Fix textcomplete not matching properly
- Fix and refactor cursor tag and cursor menu
- Fix Japanese, Chinese font styles
- Fix minor bugs of UI and seletor syntaxes

## <i class="fa fa-tag"></i> 0.3.4 `techstars` <i class="fa fa-clock-o"></i> 2016-01-19 00:22

### Features

- Beta Support slide mode
- Beta Support export to PDF
- Support TOC syntax
- Support embed slideshare and speakerdeck
- Support Graphviz charts
- Support YAML metadata
- Support private permission

### Enhancements

- Support pin note in history
- Support IE9 and above
- Support specify and continue line number in code block
- Changed all embed layout to 100% width
- Added auto detect default mode
- Support show last change note user
- Upgrade CodeMirror to 5.10.1 with some manual patches
- Improved server performance
- Support autocomplete for code block languages of charts

### Fixes

- Fixed some server connection issues
- Fixed several issues cause scrollMap incorrect
- Fixed cursor animation should not apply on scroll
- Fixed a possible bug in partial update
- Fixed internal href should not link out
- Fixed dropbox saver url not correct
- Fixed mathjax might not parse properly
- Fixed sequence diagram might render multiple times

## <i class="fa fa-tag"></i> 0.3.3 `moon-festival` <i class="fa fa-clock-o"></i> 2015-09-27 14:00

### Features

- Added status bar below editor
- Added resizable grid in both mode
- Added title reminder if have unread changes
- Support todo list change in the view mode
- Support export to HTML
- Changed to a new theme, One Dark(modified version)

### Enhancements

- Support extra tags in todo list
- Changed overall font styles
- Optimized build sync scroll map, gain lots better performance
- Support and improved print styles
- Support to use CDN
- Image and link will href to new tab ors window
- Support auto scroll to corresponding position when change mode from view to edit
- Minor UI/UX tweaks

### Fixes

- Change DB schema to support long title
- Change editable permission icon to avoid misunderstanding
- Fixed some issues in OT and reconnection
- Fixed cursor menu and cursor tag are not calculate doc height properly
- Fixed scroll top might not animate
- Fixed scroll top not save and restore properly
- Fixed history might not delete or clear properly
- Fixed server might not clean client properly

## <i class="fa fa-tag"></i> 0.3.2 `typhoon` <i class="fa fa-clock-o"></i> 2015-07-11 12:30

### Features

- Support operational transformation
- Support show other user selections
- Support show user profile image if available

### Enhancements

- Updated editor to 5.4.0
- Change UI share to publish to avoid misleading
- Added random color in blockquote tag
- Optimized image renderer, avoid duplicated rendering
- Optimized building syncscroll map, make it faster
- Optimized SEO on publish and edit note

## <i class="fa fa-tag"></i> 0.3.1 `clearsky` <i class="fa fa-clock-o"></i> 2015-06-30 16:00

### Features

- Added auto table of content
- Added basic permission control
- Added view count in share note

### Enhancements

- Toolbar now will hide in single view
- History time now will auto update
- Smooth scroll on anchor changed
- Updated video style

### Fixes

- Note might not clear when all users disconnect
- Blockquote tag not parsed properly
- History style not correct

## <i class="fa fa-tag"></i> 0.3.0 `sunrise` <i class="fa fa-clock-o"></i> 2015-06-15 24:00

### Enhancements

- Used short url in share notes
- Added upload image button on toolbar
- Share notes are now SEO and mobile friendly
- Updated code block style
- Newline now will cause line breaks
- Image now will link out
- Used otk to avoid race condition
- Used hash to avoid data inconsistency
- Optimized server realtime script

### Fixes

- Composition input might lost or duplicated when other input involved
- Note title might not save properly
- Todo list not render properly

## <i class="fa fa-tag"></i> 0.2.9 `wildfire` <i class="fa fa-clock-o"></i> 2015-05-30 14:00

### Features

- Support text auto complete
- Support cursor tag and random last name
- Support online user list
- Support show user info in blockquote

### Enhancements

- Added more code highlighting support
- Added more continue list support
- Adjust menu and history filter UI for better UX
- Adjust sync scoll animte to gain performance
- Change compression method of dynamic data
- Optimized render script

### Fixes

- Access history fallback might get wrong
- Sync scroll not accurate
- Sync scroll reach bottom range too much
- Detect login state change not accurate
- Detect editor focus not accurate
- Server not handle some editor events

## <i class="fa fa-tag"></i> 0.2.8 `flame` <i class="fa fa-clock-o"></i> 2015-05-15 12:00

### Features

- Support drag-n-drop(exclude firefox) and paste image inline
- Support tags filter in history
- Support sublime-like shortcut keys

### Enhancements

- Adjust index description
- Adjust toolbar ui and view font
- Remove scroll sync delay and gain accuracy

### Fixes

- Partial update in the front and the end might not render properly
- Server not handle some editor events

## <i class="fa fa-tag"></i> 0.2.7 `fuel` <i class="fa fa-clock-o"></i> 2015-05-03 12:00

### Features

- Support facebook, twitter, github, dropbox login
- Support own history

### Enhancements

- Adjust history ui
- Upgrade realtime package
- Upgrade editor package, now support composition input better

### Fixes

- Partial update might not render properly
- Cursor focus might not at correct position

## <i class="fa fa-tag"></i> 0.2.6 `zippo` <i class="fa fa-clock-o"></i> 2015-04-24 16:00

### Features

- Support sync scroll
- Support partial update

### Enhancements

- Added feedback ui
- Adjust animations and delays
- Adjust editor viewportMargin for performance
- Adjust emit refresh event occasion
- Added editor fallback fonts
- Index page auto focus at history if valid

### Fixes

- Server might not disconnect client properly
- Resume connection might restore wrong info

## <i class="fa fa-tag"></i> 0.2.5 `lightning` <i class="fa fa-clock-o"></i> 2015-04-14 21:10

### Features

- Support import from dropbox and clipboard
- Support more code highlighting
- Support mathjax, sequence diagram and flow chart

### Enhancements

- Adjust toolbar and layout style
- Adjust mobile layout style
- Adjust history layout style
- Server using heartbeat to gain accuracy of online users

### Fixes

- Virtual keyboard might broken the navbar
- Adjust editor viewportMargin for preloading content

## <i class="fa fa-tag"></i> 0.2.4 `flint` <i class="fa fa-clock-o"></i> 2015-04-10 12:40

### Features

- Support save to dropbox
- Show other users' cursor with light color

### Enhancements

- Adjust toolbar layout style for future

### Fixes

- Title might not render properly
- Code border style might not show properly
- Server might not connect concurrent client properly

## <i class="fa fa-tag"></i> 0.2.3 `light` <i class="fa fa-clock-o"></i> 2015-04-06 20:30

### Features

- Support youtube, vimeo
- Support gist
- Added quick link in pretty
- Added font-smoothing style

### Enhancements

- Change the rendering engine to remarkable
- Adjust view, todo list layout style for UX
- Added responsive layout check
- Auto reload if client version mismatch
- Keep history stack after reconnect if nothing changed
- Added features page

### Fixes

- Closetags auto input might not have proper origin
- Autofocus on editor only if it's on desktop
- Prevent using real script and iframe tags
- Sorting in history by time not percise

## <i class="fa fa-tag"></i> 0.2.2 `fire` <i class="fa fa-clock-o"></i> 2015-03-27 21:10

### Features

- Support smartLists, smartypants
- Support line number on code block
- Support tags and search or sort history

### Enhancements

- Added delay on socket change
- Updated markdown-body width to match github style
- Socket changes now won't add to editor's history
- Reduce redundant server events

### Fixes

- Toolbar links might get wrong
- Wrong action redirections

## <i class="fa fa-tag"></i> 0.2.1 `spark` <i class="fa fa-clock-o"></i> 2015-03-17 13:40

### Features

- Support github-like todo-list
- Support emoji

### Enhancements

- Added more effects on transition
- Reduced rendering delay
- Auto close and match brackets
- Auto close and match tags
- Added code fold and fold gutters
- Added continue listing of markdown

## <i class="fa fa-tag"></i> 0.2.0 `launch-day` <i class="fa fa-clock-o"></i> 2015-03-14 20:20

### Features

- Markdown editor
- Preview html
- Realtime collaborate
- Cross-platformed
- Recently used history
