const fs = require("fs");
const { Sequelize } = require("sequelize");
const path = require("path");

// 读取数据库连接配置
const configFile = fs.readFileSync(
  path.join(__dirname, "../.database-connection"),
  "utf8"
);
const config = {};

configFile.split("\n").forEach((line) => {
  if (line.trim()) {
    const [key, value] = line.split(":").map((item) => item.trim());
    config[key] = value;
  }
});

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
    return true;
  } catch (error) {
    console.error("数据库连接失败:", error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
};
