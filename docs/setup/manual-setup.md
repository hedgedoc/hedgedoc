Manual Installation
===

## Requirements on your server

- Node.js 8.5 or up
- Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL). Must use charset `utf8`: this is typically the
  default in PostgreSQL and SQLite, while in MySQL and MariaDB utf8 might need to be set with
  `alter database <DBNAME> character set utf8 collate utf8_bin;`
- npm (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
- yarn
- Bash (for the setup script)
- For **building** CodiMD we recommend to use a machine with at least **2GB** RAM


## Instructions

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Clone this repository (preferred) or download a release and unzip it.
3. Enter the directory and type `bin/setup`, which will install npm dependencies and create configs.
4. Modify `config.json`, see docs [here](https://github.com/codimd/server/blob/master/docs/configuration-config-file.md).
5. Instead of modifying `config.json`, it's possible to configure CodiMD through environment variables which will
   overwrite the configs, see docs [here](https://github.com/codimd/server/blob/master/docs/configuration-env-vars.md).
6. Build front-end bundle by `yarn run build` (use `yarn run dev` if you are in development)
7. Modify the file named `.sequelizerc`, change the value of the variable `url` with your db connection string. For example:
   - `postgres://username:password@localhost:5432/codimd`
   - `mysql://username:password@localhost:3306/codimd`
   - `sqlite://:memory:`
8. It is recommended to start your server manually once: `npm start --production`, this way it's easier to see warnings or errors that might occur (leave out `--production` for development).
9. Run the server as you like (node, forever, pm2, SystemD, Init-Scripts)


## How to upgrade your installation

If you are upgrading CodiMD from an older version, follow these steps:

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Verify which version you were running before and take a look at [migrations and breaking changes](../guides/migrations-and-breaking-changes.md) to see if additional steps, or configuration changes are necessary!
3. Fully stop your old CodiMD server.
4. `git pull` or unzip a new release in the directory.
5. Run `bin/setup`. This will take care of installing dependencies. It is safe to run on an existing installation.
6. Build front-end bundle by `yarn run build` (use `yarn run dev` if you are in development).
7. It is recommended to start your server manually once: `npm start --production`, this way it's easier to see warnings or errors that might occur (leave out `--production` for development).
8. You can now restart the CodiMD server!
