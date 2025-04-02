const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Conversation = require("./Conversation");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sequence_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "对话轮次顺序",
    },
    created_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "message",
    timestamps: false,
  }
);

// 建立与Conversation的关系
Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
  onDelete: "CASCADE",
});

Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
});

module.exports = Message;
