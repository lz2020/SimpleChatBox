const jwt = require("jsonwebtoken");

// JWT密钥，在实际应用中应该放在环境变量中
const JWT_SECRET = "simplechatbox-secret-key";

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" } // 有效期7天
  );
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
