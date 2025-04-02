const express = require("express");
const path = require("path");
const cors = require("cors");
const { testConnection, syncDatabase } = require("./models");

// 引入路由
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const configRoutes = require("./routes/configRoutes");

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, "public")));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user/config", configRoutes);

// 提供HTML文件
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error("无法连接到数据库，服务器启动失败");
      return;
    }

    // 同步数据库结构
    await syncDatabase();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("服务器启动错误:", error);
  }
};

startServer();
