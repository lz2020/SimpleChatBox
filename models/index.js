const User = require("./User");
const Conversation = require("./Conversation");
const Message = require("./Message");
const ApiConfig = require("./ApiConfig");
const { sequelize, testConnection } = require("../config/db");

// 添加用户和对话的关联关系
User.hasMany(Conversation, { foreignKey: "user_id" });
Conversation.belongsTo(User, { foreignKey: "user_id" });

// 同步数据库结构
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("数据库表同步完成");
  } catch (error) {
    console.error("数据库表同步失败:", error);
  }
};

module.exports = {
  User,
  Conversation,
  Message,
  ApiConfig,
  sequelize,
  testConnection,
  syncDatabase,
};
