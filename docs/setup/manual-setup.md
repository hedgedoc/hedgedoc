# Manual Installation

## Requirements on your server

- Node.js 6.x or up (test up to 7.5.0) and <10.x
- Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL) use charset `utf8`
- npm (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
- `libssl-dev` for building scrypt (see [here](https://github.com/ml1nk/node-scrypt/blob/master/README.md#installation-instructions) for further information)
- For **building** CodiMD we recommend to use a machine with at least **2GB** RAM

## Instructions

1. Download a release and unzip or clone into a directory
2. Enter the directory and type `bin/setup`, which will install npm dependencies and create configs. The setup script is written in Bash, you would need bash as a prerequisite.
3. Setup the configs, see more below
4. Setup environment variables which will overwrite the configs
5. Build front-end bundle by `npm run build` (use `npm run dev` if you are in development)
6. Modify the file named `.sequelizerc`, change the value of the variable `url` with your db connection string
   For example: `postgres://username:password@localhost:5432/codimd`
7. Run `node_modules/.bin/sequelize db:migrate`, this step will migrate your db to the latest schema
8. Run the server as you like (node, forever, pm2)


## How to upgrade your installation

:warning: When you are still running from the old repository, please run: `git remote set-url origin https://github.com/codimd/server.git` :warning:

If you are upgrading CodiMD from an older version, follow these steps:

1. Fully stop your old server first (important)
2. `git pull` or do whatever that updates the files
3. `npm install` to update dependencies
4. Build front-end bundle by `npm run build` (use `npm run dev` if you are in development)
5. Modify the file named `.sequelizerc`, change the value of the variable `url` with your db connection string
   For example: `postgres://username:password@localhost:5432/codimd`
6. Run `node_modules/.bin/sequelize db:migrate`, this step will migrate your db to the latest schema
7. Start your whole new server!
