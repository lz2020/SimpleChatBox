const { sequelize } = require("./models");

async function verifyDatabase() {
  try {
    // 查询 conversations 表结构
    const [conversationsResult] = await sequelize.query(
      "DESCRIBE conversations;"
    );

    console.log("conversations 表结构:");
    console.table(conversationsResult);

    // 关闭连接
    await sequelize.close();
  } catch (error) {
    console.error("验证数据库结构错误:", error);
  }
}

verifyDatabase();
