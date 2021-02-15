'use strict'
// external modules
const shortId = require('shortid')

module.exports = function (sequelize, DataTypes) {
  const Temp = sequelize.define('Temp', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: shortId.generate
    },
    data: {
      type: DataTypes.TEXT
    }
  })

  return Temp
}
