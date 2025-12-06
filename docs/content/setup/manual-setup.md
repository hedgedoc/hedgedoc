# Manual Installation

!!! info "Requirements on your server"
    - Node.js 18 or later
      We recommend to run HedgeDoc with the latest LTS release of Node.js.
    - Database (PostgreSQL, MySQL, MariaDB, SQLite)  
      The database must use charset `utf8`. This is typically the default in PostgreSQL and SQLite.  
      In MySQL and MariaDB UTF-8 might need to be set with `alter database <DBNAME> character set utf8 collate utf8_bin;`  
      Be aware of older MySQL and MariaDB versions which sometimes use shorter representations of UTF-8 than 4 bytes.
      This can break if symbols with more bytes are used.
      You can use `alter database <DBNAME> character set utf8mb4 COLLATE utf8mb4_unicode_ci` to be on the safe side.
    - NPM (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
    - [Yarn 4](https://yarnpkg.com/): Running `corepack enable` once should be sufficient, Node.js will then
      automatically use the correct version of Yarn. If `corepack` is not available, try `npm i -g corepack` first.
      See [the official docs](https://yarnpkg.com/getting-started/install) for more information and other options.
    - Bash (for the setup script)
    - For **building** the HedgeDoc frontend you need a machine with at least **2 GB** RAM.
      - Starting with release 1.7 the release tarball includes the prebuilt frontend, so building it yourself is not necessary.

1. Check if you meet the [requirements at the top of this document](#manual-installation).
2. Download the [latest release](https://hedgedoc.org/latest-release/) and extract it.  
   <small>Alternatively, you can use Git to clone the repository and checkout a release, e.g. with `git clone -b 1.10.5 https://github.com/hedgedoc/hedgedoc.git`.</small>
3. Enter the directory and execute `bin/setup`, which will install the dependencies and create example configs.
4. Configure HedgeDoc: To get started, you can use this minimal `config.json`:
   ```json
   {
     "production": {
       "db": {
         "dialect": "sqlite",
         "storage": "./db.hedgedoc.sqlite"
      },
       "urlAddPort": true,
       "domain": "localhost"
     }
   }
   ```
   It's also possible to use environment variables.
   For details, have a look at [the configuration documentation](../configuration.md).
5. *:octicons-light-bulb-16: If you use the release tarball for 1.7.0 or newer, this step can be skipped.*  
   Build the frontend bundle by running `yarn install --immutable` and then `yarn build`. The extra `yarn install --immutable` is necessary as `bin/setup` does not install the build dependencies.
6. It is recommended to start your server manually once:  
   ```shell
   NODE_ENV=production yarn start
   ```
   This way it's easier to see warnings or errors that might occur.  
   <small>You can leave out `NODE_ENV=production` for development.</small>  
7. If you use the example config, HedgeDoc should now be available at [http://localhost:3000](http://localhost:3000).
8. Run the server as you like (node, forever, pm2, systemd, Init-Scripts).  
   See [below](#systemd-unit-example) for an example using systemd.

## Upgrading

!!! warning
    Before you upgrade, **always read the release notes**.  
    You can find them on our [releases page](https://hedgedoc.org/releases/).

If you want to upgrade HedgeDoc from an older version, follow these steps:

1. Check if you still meet the [requirements at the top of this document](#requirements-on-your-server).
2. Ensure you read the [release notes](https://hedgedoc.org/releases/) of all versions between your current version
   and the latest release.
2. Fully stop your old HedgeDoc server.
3. [Download](https://hedgedoc.org/latest-release/) the new release and extract it over the old directory.  
   <small>If you use Git, you can check out the new tag with e.g. `git fetch origin && git checkout 1.10.5`</small>
5. Run `bin/setup`. This will take care of installing dependencies. It is safe to run on an existing installation.
6. *:octicons-light-bulb-16: If you used the release tarball for 1.7.0 or newer, this step can be skipped.*  
   Build the frontend bundle by running `yarn install --immutable` and `yarn build`. The extra `yarn install --immutable` is necessary as `bin/setup` does not install the       build dependencies.
7. It is recommended to start your server manually once:
   ```shell
   NODE_ENV=production yarn start
   ```
   This way it's easier to see warnings or errors that might occur.
8. You can now restart the HedgeDoc server!

## Systemd Unit Example
Using the unit file below, you can run HedgeDoc as a systemd service.

!!! warning
    - In this example, you must configure HedgeDoc using the `config.json` file and the 
    `production` key.
    - Make sure the user and group `hedgedoc` exists and has appropriate permissions in the
    directory you installed HedgeDoc in or change the `User` and `Group` settings in the unit
    file.
    - Make sure `WorkingDirectory` points to the directory you installed HedgeDoc in.
    - Make sure `ReadWritePaths` contains all directories HedgeDoc might write to. This may
    include the `public/uploads` folder if you configured local storage. If you use SQLite, you
    must also include the directory where the database file is saved. **Do not save the SQLite
    file in the root directory of the HedgeDoc installation**, but create a subfolder like `db`!
    - If you use an external database like PostgreSQL or MariaDB, make sure to add a corresponding
    `After` statement.
    - `SystemCallFilter=`
      - More about filtering system calls can be read in the [systemd.exec documentation](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#System%20Call%20Filtering).
      - If the service does not start please have a look at your systemd-journal (`journalctl -f`) and then try to `systemctl start hedgedoc.service`.
        - In the systemd-journal you will then see a line with `... kernel: audit: ...`. The important part of this line is `syscall=` (example `syscall=330`).
        - You can lookup the name of the syscall for the numer on a website like <https://filippo.io/linux-syscall-table/>. Example: 330 is `pkey_alloc`.
        - Add the name of the syscall at the end of the line of `SystemCallFilter=` (separated by spaces), `systemctl daemon-reload` and then `systemctl restart hedgedoc.service`.
        - If it does not work have another look at the systemd-journal and repeat the previous steps (add/allow additional needed syscalls).
        - You can also use groups of syscalls (starting with `@`). See the systemd.exec documentation as it contains a table of `Currently predefined system call sets` you can use. Of course as HedgeDoc is usually exposed to the internet it might be wise to only allow syscalls HedgeDoc really needs depending on your own paranoia. ;-)

```ini
[Unit]
Description=HedgeDoc - The best platform to write and share markdown.
Documentation=https://docs.hedgedoc.org/
After=network.target
# Uncomment if you use MariaDB/MySQL
# After=mysql.service
# Uncomment if you use PostgreSQL
# After=postgresql.service

[Service]
Type=exec
Environment=NODE_ENV=production
Restart=always
RestartSec=2s
ExecStart=/usr/bin/yarn start
CapabilityBoundingSet=
NoNewPrivileges=true
PrivateDevices=true
RemoveIPC=true
LockPersonality=true
ProtectControlGroups=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectClock=true
ProtectHostname=true
ProtectProc=noaccess
RestrictRealtime=true
RestrictSUIDSGID=true
RestrictNamespaces=true
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
SystemCallArchitectures=native
SystemCallFilter=@system-service pkey_alloc pkey_mprotect

# You may have to adjust these settings
User=hedgedoc
Group=hedgedoc
WorkingDirectory=/opt/hedgedoc

# Example: local storage for uploads and SQLite
# ReadWritePaths=/opt/hedgedoc/public/uploads /opt/hedgedoc/db

[Install]
WantedBy=multi-user.target
```
