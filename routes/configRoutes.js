const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getUserConfig,
  updateUserConfig,
} = require("../controllers/configController");

// 所有配置路由都需要认证
router.use(authenticate);

// 获取用户配置
router.get("/", getUserConfig);

// 更新用户配置
router.put("/", updateUserConfig);

module.exports = router;
