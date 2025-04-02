const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const ApiConfig = sequelize.define(
  "ApiConfig",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    model_name: {
      type: DataTypes.ENUM("deepseek", "openai"),
      allowNull: false,
      comment: "模型名字",
    },
    model_tag: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "模型名字",
    },
    api_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "api key",
    },
  },
  {
    tableName: "api_configs",
    timestamps: false,
  }
);

// 建立与User的关系
ApiConfig.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

User.hasOne(ApiConfig, {
  foreignKey: "user_id",
});

module.exports = ApiConfig;
