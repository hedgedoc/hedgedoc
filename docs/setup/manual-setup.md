Manual Installation
===

## Requirements on your server

- Node.js 8.5 or up
- Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL) use charset `utf8`
- npm (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
- yarn
- Bash (for the setup script)
- For **building** CodiMD we recommend to use a machine with at least **2GB** RAM


## Instructions

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Clone this repository (preferred) or download a release and unzip it.
3. Enter the directory and type `bin/setup`, which will install npm dependencies and create configs.
4. Setup the configs, see more below
5. Setup environment variables which will overwrite the configs
6. Build front-end bundle by `npm run build` (use `npm run dev` if you are in development)
7. Modify the file named `.sequelizerc`, change the value of the variable `url` with your db connection string
   For example: `postgres://username:password@localhost:5432/codimd`
8. It is recommended to start your server manually once: `npm start --production`, this way it's easier to see warnings or errors that might occur (leave out `--production` for development).
9. Run the server as you like (node, forever, pm2, SystemD, Init-Scripts)


## How to upgrade your installation

If you are upgrading CodiMD from an older version, follow these steps:

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Verify which version you were running before and take a look at [migrations and breaking changes](../guides/migrations-and-breaking-changes.md) to see if additional steps, or configuration changes are necessary!
3. Fully stop your old CodiMD server.
4. `git pull` or unzip a new release in the directory.
5. Run `bin/setup`. This will take care of installing dependencies. It is safe to run on an existing installation.
6. Build front-end bundle by `npm run build` (use `npm run dev` if you are in development).
7. It is recommended to start your server manually once: `npm start --production`, this way it's easier to see warnings or errors that might occur (leave out `--production` for development).
8. You can now restart the CodiMD server!
