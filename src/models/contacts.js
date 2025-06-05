"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Contacts extends Model {
    static associate() {}
  }

  Contacts.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
      },
      linkedId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      linkPrecedence: {
        type: DataTypes.ENUM('primary', 'secondary'),
        allowNull: false,
        defaultValue: 'primary'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, 
    {
      sequelize,
      modelName: 'Contacts',
      paranoid: true
    }
  );

  return Contacts;
};