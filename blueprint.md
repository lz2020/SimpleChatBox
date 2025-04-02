---

## 完整技术方案

---

### 一、技术栈
1. **前端**  
   - 核心：HTML5 + CSS3 + JavaScript (ES6+)  
2. **后端**  
   - 框架：Node.js + Express  
   - orm: Sequelize
3. **数据库**  
   - MySQL 8.0+  

---

### 二、技术细节

#### 1. 数据库定义

```sql
-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL COMMENT 'bcrypt加密',
    created_at datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户';

-- 对话表
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='对话上下文';

-- 消息表
CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `role` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `sequence_num` int NOT NULL COMMENT '对话轮次顺序',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_order` (`conversation_id`,`sequence_num`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='消息';

-- API配置表
CREATE TABLE api_configs (
    user_id INT PRIMARY KEY,
    model_name ENUM('deepseek', 'openai') NOT NULL COMMENT '模型名字', 
    model_tag VARCHAR(50) NOT NULL COMMENT '模型名字',
    api_key VARCHAR(255) NOT NULL COMMENT 'api key',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='保存用户的api key';
```

#### 2. 核心接口
| 路径             | 方法 | 功能                                  |
| ---------------- | ---- | ------------------------------------- |
| `/auth/login`    | POST | 用户登录（返回JWT）                   |
| `/auth/register` | POST | 用户注册                              |
| `/conversations` | GET  | 获取对话列表                          |
| `/conversations` | POST | 创建新对话                            |
| `/messages`      | GET  | 获取历史消息（需conversation_id参数） |
| `/messages`      | POST | 发送新消息                            |
| `/user/config`   | GET  | 获取当前用户配置                      |
| `/user/config`   | PUT  | 更新用户配置                          |

#### 3. 界面布局规范

**登录界面**  

```html
<div class="login-box">
  <input type="text" id="username" placeholder="用户名">
  <input type="password" id="password" placeholder="密码">
  <button>登录</button>
  <button>注册</button>
</div>
```

**主界面布局**  

```html
<div class="main-container">
  <!-- 左侧功能区 -->
  <div class="sidebar">
    <button class="new-chat">+ 新对话</button>
    <div class="history-list">
      <div class="history-item" data-id="1">
        <div class="title">对话标题</div>
        <div class="time">15:30</div>
      </div>
    </div>
    <button class="user-center">用户中心</button>
  </div>

  <!-- 右侧聊天区 -->
  <div class="chat-area">
    <div class="message-container">
      <div class="message user">用户消息</div>
      <div class="message bot">
        <div class="content">AI回复</div>
        <button class="copy-btn">复制</button>
      </div>
    </div>
    <div class="input-box">
      <textarea rows="3"></textarea>
      <div class="action-bar">
        <button class="send-btn">发送</button>
      </div>
    </div>
  </div>
</div>

<!-- 用户中心弹窗 -->
<div class="config-modal hidden" style="display: none">
  <div class="model-content">
  	<select id="model-select">
    	<option value="deepseek">DeepSeek</option>
	    <option value="openai">OpenAI</option>
	  </select>
    <div class="model-settings">
  		 <label>模型版本<label>
       <input type="text" class="model-tag"/>
       <label>API KEY</label>
       <input type="password" class="api-key"/>
	  </div>
  </div>
  <button>保存设置</button>
</div>
```

#### 4. 模型的API调用

```js
// deepseek
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com/chat/completions',
        apiKey: '<your API key>'
});

const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

// openai 
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.openai.com/v1/chat/completions',
        apiKey: '<your API key>'
});

const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-4o",
  });
```



---

### 三、分步骤实施

#### 第1步：环境准备

1. 初始化Node项目
2. 创建基础目录结构：  
   ```
   /project
     /public
       /css
         style.css
       /js
         app.js
       login.html
       index.html
     server.js
   ```

#### 第2步：数据库连接实施

完成第1步后，请完成

1. 参考 [数据库定义](#数据库定义) 搭建基础的orm框架
1. 读取数据库连接文件 .database-connection ，测试连接数据库是否成功

#### 第3步：实现登录功能

完成第2步后，请完成

1. 参考 [登录界面](#登录界面) 完成登录界面的布局和css
2. 完成输入用户名登录到主界面(可以为空页面)的功能
3. 完成用户注册新账号的功能
4. 完成登录和注册时错误提示功能
5. 参考 [数据库定义](#数据库定义)  完成上述功能
6. 参考 [核心接口](#核心接口) 完成上述功能

#### 第4步：实现主界面的基础布局

完成第3步后，请完成

1. 参考 [主界面布局](#主界面布局) 完成主界面的布局和css
2. 左侧功能区占据20%的宽度，右侧聊天区占据80%的宽度
3. 功能区中，上面新对话占据1/8的高度，中间历史对话列表占据6/8的高度，下面用户中心占据1/8的高度
4. 聊天区中，上面信息显示区占据80%的高度，下面整个用户输入区占据20%的高度
5. 这一步只实现模块级元素在界面的定位布局，不需要考虑很多细节，因为后面会逐步完善

#### 第5步：完善聊天窗口界面

完成第4步后，请完成

1. 聊天信息显示在居中60%宽度的区域内
2. 用户的提问居右，内容由圆角灰色矩形包裹。矩形大小随着内容长短动态变化。
3. ai的回答居左，内容没有包裹，没有边框，可以显示markdown格式。
4. 用户的输入区整体由圆角灰色矩形包裹。输入框在输入区的上部，按钮在输入区的下部。
5. 输入框不显示边框。支持用户enter+shift换行。
6. 当输入框换行而扩大时，整个输入区实现底边不动，向上扩大。最大高度为整个页面高度的2/7。同时实现扩大后不遮挡上方的聊天信息的显示。
7. 发送按钮处于所在“行”的右边，左边可以预留空间，方便未来插入其他的功能按钮。
8. 参考 [主界面布局](#主界面布局) 完成上述界面

#### 第6步：实现基础聊天功能

完成第5步后，请完成

1. 用户在输入框中输入问题，模型完成回答
2. 已经发生的用户提问和ai回答，每一条按照role和对应的内容组合在一起，都要作为下一次ai回答的提示词。
3. 除了点击发送按钮发送消息以外，还支持用户键入enter直接发送。
4. 等待ai模型回答时，在ai要回答的位置添加一个灰色的旋转的等待图标，发送按钮也变成灰色失效。
5. 点击一个ai回答内容下方的复制按钮，可以将本条ai回答的文本信息复制到粘贴板上。
6. 参考 [模型的API调用](#模型的API调用) 完成上述功能。

#### 第7步：实现新对话和对话的存储功能

完成第6步后，请完成

1. 每一次用户提问后，或者ai完成回答后，都要将本次的内容存入数据库。
2. 用户点击 新对话 按钮，会清空当前的聊天信息，开始全新的对话。
3. 全新对话，没有标题，需要等用户的第一次提问完成后，总结出一个标题。
4. 请参考 [数据库定义](#数据库定义)  中字段的定义和限制条件完成上述功能。
5. 请参考 [核心接口](#核心接口) 完成上述功能。

#### 第8步：实现历史对话的管理功能

完成第7步后，请完成

1. 左边功能区中部的历史信息，显示的是当前登录用户的历史对话列表。
2. 列表按照对话的修改时间倒序从上到下排列
3. 列表的每一项显示的是对话的标题。
4. 用户点击列表中的一项，就会清空当前的聊天信息，然后，按照对话的sequence_num从小到大依次加载到聊天窗口里。
5. 加载完历史对话后，用户可以继续上一次的话题，继续聊天。
6. 每次聊天记录存储以后，都要刷新一下历史对话列表。
7. 当用户进入或者刷新主界面后，需要刷新历史对话列表。如果当前用户有历史对话记录，聊天信息直接加载最近的对话。如果没有历史对话记录，效果相当于点击了 新对话 按钮。
8. 请参考 [数据库定义](#数据库定义)  中字段的定义和限制条件完成上述功能。
9. 请参考 [核心接口](#核心接口) 完成上述功能。

#### 第9步：实现用户中心管理功能

完成第8步后，请完成

1. 用户点击 用户中心 按钮，在按钮的右上方弹出一个 用户中心弹窗。
2. 用户可以选择模型名称，填入 model-tag，填入对应的 api-key，保存后，完成对当前对话模型的替换。
3. 请参考 [主界面布局](#主界面布局) 完成上述功能。
4. 请参考 [数据库定义](#数据库定义)  中字段的定义和限制条件完成上述功能。
5. 请参考 [核心接口](#核心接口) 完成上述功能。
