const { Message, Conversation } = require("../models");
const { sequelize } = require("../config/db");
const OpenAI = require("openai");
const { ApiConfig } = require("../models");

// 获取对话消息列表
const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.query;

    if (!conversation_id) {
      return res.status(400).json({ message: "缺少对话ID参数" });
    }

    // 检查对话是否属于当前用户
    const conversation = await Conversation.findOne({
      where: {
        id: conversation_id,
        user_id: req.user.id,
      },
    });

    if (!conversation) {
      return res.status(403).json({ message: "无权访问该对话" });
    }

    const messages = await Message.findAll({
      where: { conversation_id },
      order: [["sequence_num", "ASC"]],
      attributes: ["id", "role", "content", "sequence_num", "created_time"],
    });

    res.json(messages);
  } catch (error) {
    console.error("获取消息列表错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 发送新消息
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { conversation_id, content } = req.body;

    if (!conversation_id || !content) {
      await transaction.rollback();
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查对话是否存在且属于当前用户
    const conversation = await Conversation.findOne({
      where: {
        id: conversation_id,
        user_id: req.user.id,
      },
    });

    if (!conversation) {
      await transaction.rollback();
      return res.status(403).json({ message: "无权访问该对话或对话不存在" });
    }

    // 获取当前对话中的最大序列号
    const maxSequence =
      (await Message.max("sequence_num", {
        where: { conversation_id },
      })) || 0;

    // 保存用户消息, 但没有立即生效
    const userMessage = await Message.create(
      {
        conversation_id,
        role: "user",
        content,
        sequence_num: maxSequence + 1,
      },
      { transaction }
    );

    // 更新对话的修改时间
    conversation.modified_time = new Date();

    // 如果是第一条消息，更新对话标题
    if (maxSequence === 0) {
      // 使用内容的前20个字符作为标题
      conversation.title =
        content.length > 20 ? content.substring(0, 20) + "..." : content;
    }

    await conversation.save({ transaction });

    // 获取用户的API配置
    const apiConfig = await ApiConfig.findOne({
      where: { user_id: req.user.id },
    });

    // 创建消息历史
    const messageHistory = await Message.findAll({
      where: { conversation_id },
      order: [["sequence_num", "ASC"]],
      attributes: ["role", "content"],
    });

    // 组装发送给模型的消息数组
    const messagesToSend = messageHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加用户最新消息
    messagesToSend.push({
      role: "user",
      content: content,
    });

    // 默认API配置
    let openai;
    let modelName;

    if (apiConfig) {
      // 使用用户的API配置
      if (apiConfig.model_name === "deepseek") {
        openai = new OpenAI({
          baseURL: "https://api.deepseek.com/v1",
          apiKey: apiConfig.api_key,
        });
        modelName = apiConfig.model_tag;
      } else {
        openai = new OpenAI({
          apiKey: apiConfig.api_key,
        });
        modelName = apiConfig.model_tag;
      }
    } else {
      // 使用默认API配置
      openai = new OpenAI({
        baseURL: "https://api.deepseek.com/v1",
        apiKey: "your-default-api-key", // 实际应用中应该从环境变量读取
      });
      modelName = "deepseek-chat";
    }

    // 发送请求给模型API
    const completion = await openai.chat.completions.create({
      messages: messagesToSend,
      model: modelName,
    });

    // 获取模型的回复
    const assistantContent = completion.choices[0].message.content;

    // 保存助手的回复
    const assistantMessage = await Message.create(
      {
        conversation_id,
        role: "assistant",
        content: assistantContent,
        sequence_num: maxSequence + 2,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("发送消息错误:", error);
    res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
