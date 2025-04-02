const { ApiConfig } = require("../models");

// 获取用户API配置
const getUserConfig = async (req, res) => {
  try {
    const userId = req.user.id;

    const config = await ApiConfig.findOne({
      where: { user_id: userId },
      attributes: ["model_name", "model_tag", "api_key"],
    });

    if (!config) {
      return res.status(404).json({
        message: "未找到用户配置",
        hasConfig: false,
      });
    }

    res.json({
      model_name: config.model_name,
      model_tag: config.model_tag,
      api_key: config.api_key,
      hasConfig: true,
    });
  } catch (error) {
    console.error("获取用户配置错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新或创建用户API配置
const updateUserConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const { model_name, model_tag, api_key } = req.body;

    // 验证输入
    if (!model_name || !model_tag || !api_key) {
      return res
        .status(400)
        .json({ message: "模型名称、标签和API密钥不能为空" });
    }

    // 验证模型名称是否在允许的范围内
    if (!["deepseek", "openai"].includes(model_name)) {
      return res.status(400).json({ message: "不支持的模型名称" });
    }

    // 查找现有配置
    let config = await ApiConfig.findOne({
      where: { user_id: userId },
    });

    if (config) {
      // 更新现有配置
      config.model_name = model_name;
      config.model_tag = model_tag;
      config.api_key = api_key;
      await config.save();
    } else {
      // 创建新配置
      config = await ApiConfig.create({
        user_id: userId,
        model_name,
        model_tag,
        api_key,
      });
    }

    res.json({
      message: "配置更新成功",
      model_name: config.model_name,
      model_tag: config.model_tag,
      api_key: config.api_key,
    });
  } catch (error) {
    console.error("更新用户配置错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

module.exports = {
  getUserConfig,
  updateUserConfig,
};
