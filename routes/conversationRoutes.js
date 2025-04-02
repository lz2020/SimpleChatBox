const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
} = require("../controllers/conversationController");

// 所有会话路由都需要认证
router.use(authenticate);

// 获取会话列表
router.get("/", getConversations);

// 创建新会话
router.post("/", createConversation);

// 获取单个会话
router.get("/:id", getConversation);

// 更新会话标题
router.put("/:id", updateConversation);

module.exports = router;
