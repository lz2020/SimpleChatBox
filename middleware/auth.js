const { verifyToken } = require("../config/jwt");
const { User } = require("../models");

// 验证用户令牌
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "无效或过期的令牌" });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    // 将用户信息添加到请求对象中
    req.user = {
      id: user.id,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error("认证错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

module.exports = {
  authenticate,
};
