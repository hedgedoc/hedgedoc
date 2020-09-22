// const clipboardy = require('clipboardy');
module.exports = ( on ) => {
  on('task', {
    getClipboard () {
      // return clipboardy.readSync();
    }
  });
};
