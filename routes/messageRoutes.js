const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

// 所有消息路由都需要认证
router.use(authenticate);

// 获取消息列表
router.get("/", getMessages);

// 发送新消息
router.post("/", sendMessage);

module.exports = router;
