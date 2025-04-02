const { User } = require("../models");
const { generateToken } = require("../config/jwt");

// 用户注册
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "用户名已存在" });
    }

    // 创建新用户
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      username,
      password_hash: passwordHash,
    });

    // 生成JWT令牌
    const token = generateToken(user);

    res.status(201).json({
      message: "注册成功",
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "用户名或密码不正确" });
    }

    // 验证密码
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "用户名或密码不正确" });
    }

    // 生成JWT令牌
    const token = generateToken(user);

    res.json({
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

module.exports = {
  register,
  login,
};
