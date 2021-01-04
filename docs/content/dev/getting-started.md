# Getting started

## Preparing for running the code

**Notice:** *There's [specialised instructions for docker](../setup/docker.md) or [heroku](../setup/heroku.md), if you prefer running code this way!*

1. Clone the repository with `git clone https://github.com/hedgedoc/hedgedoc.git hedgedoc-server`
   (cloning is the preferred way, but you can also download and unzip a release)

2. Enter the directory and run `bin/setup`, which will install npm dependencies
   and create configs. The setup script is written in Bash, you would need bash
   as a prerequisite.

3. Setup the [config file](../configuration.md) or set up
   [environment variables](../configuration.md).

## Running the Code

Now that everything is in place, we can start HedgeDoc:

1. `yarn run build` will build the frontend bundle. It uses webpack to do that.
2. Run the server with `node app.js`

## Running the Code with Auto-Reload

The commands above are fine for production, but you're a developer and surely
you want to change things. You would need to restart both commands whenever you
change something. Luckily, you can run these commands that will automatically
rebuild the frontend or restart the server if necessary.

The commands will stay active in your terminal, so you will need multiple tabs
to run both at the same time.

1. Use `yarn run dev` if you want webpack to continuously rebuild the frontend
   code.

2. To auto-reload the server, the easiest method is to install [nodemon](https://www.npmjs.com/package/nodemon)
   and run `nodemon --watch app.js --watch lib --watch locales app.js`.

## Structure

The repository contains two parts: a server (backend) and a client (frontend).
most of the server code is in `/lib` and most of the client code is in `public`.

```text
hedgedoc-server/
├── docs/           --- documentation
├── lib/            --- server code
├── test/           --- test suite
└── public/         --- client code
    ├── css/        --- css styles
    ├── docs/       --- default documents
    ├── js/         --- js scripts
    ├── vendor/     --- vendor includes
    └── views/      --- view templates
```
