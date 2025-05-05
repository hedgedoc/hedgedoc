'use strict'
// external modules
const nanoid = require('nanoid')

module.exports = function (sequelize, DataTypes) {
  const Temp = sequelize.define('Temp', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: nanoid.nanoid
    },
    data: {
      type: DataTypes.TEXT
    }
  })

  return Temp
}
