const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    modified_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "conversations",
    timestamps: false,
  }
);

module.exports = Conversation;
