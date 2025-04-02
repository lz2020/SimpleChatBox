const { Conversation, Message } = require("../models");
const { Op } = require("sequelize");

// 获取对话列表
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: { user_id: userId },
      order: [["modified_time", "DESC"]],
      attributes: ["id", "title", "created_time", "modified_time"],
    });

    res.json(conversations);
  } catch (error) {
    console.error("获取对话列表错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 创建新对话
const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title = "新对话" } = req.body;

    const conversation = await Conversation.create({
      user_id: userId,
      title,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("创建对话错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取单个对话
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      where: { id, user_id: userId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "对话不存在" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("获取对话错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新对话标题
const updateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "标题不能为空" });
    }

    const conversation = await Conversation.findOne({
      where: { id, user_id: userId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "对话不存在" });
    }

    conversation.title = title;
    conversation.modified_time = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    console.error("更新对话错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
};
