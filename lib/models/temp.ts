'use strict'
// external modules
import { nanoid } from 'nanoid'

module.exports = function (sequelize: any, DataTypes: any): any {
  const Temp = sequelize.define('Temp', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: nanoid
    },
    data: {
      type: DataTypes.TEXT
    }
  })

  return Temp
}
