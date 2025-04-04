document.addEventListener("DOMContentLoaded", () => {
  // 检查是否已登录
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }

  // DOM元素
  const messageContainer = document.getElementById("message-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const historyList = document.getElementById("history-list");
  const userCenterBtn = document.getElementById("user-center-btn");
  const configModal = document.getElementById("config-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modelSelect = document.getElementById("model-select");
  const modelTag = document.getElementById("model-tag");
  const apiKey = document.getElementById("api-key");
  const saveConfigBtn = document.getElementById("save-config-btn");
  const inputBox = document.querySelector(".input-box");
  const inputBoxInner = document.querySelector(".input-box-inner");

  // 当前对话ID
  let currentConversationId = null;

  // API请求头
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 初始化
  async function initialize() {
    await loadConversations();
    await loadUserConfig();
  }

  // 加载用户配置
  async function loadUserConfig() {
    try {
      const response = await fetch("/api/user/config", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasConfig) {
          modelSelect.value = data.model_name;
          modelTag.value = data.model_tag;
          apiKey.value = data.api_key;
        }
      }
    } catch (error) {
      console.error("加载用户配置错误:", error);
    }
  }

  // 保存用户配置
  async function saveUserConfig() {
    try {
      const model_name = modelSelect.value;
      const model_tag = modelTag.value;
      const api_key = apiKey.value;

      if (!model_name || !model_tag || !api_key) {
        alert("请填写所有配置项");
        return;
      }

      const response = await fetch("/api/user/config", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          model_name,
          model_tag,
          api_key,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("配置保存成功");
        closeConfigModal();
      } else {
        alert(`配置保存失败: ${data.message}`);
      }
    } catch (error) {
      console.error("保存用户配置错误:", error);
      alert("保存配置时发生错误");
    }
  }

  // 加载对话列表
  async function loadConversations() {
    try {
      const response = await fetch("/api/conversations", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("获取对话列表失败");
      }

      const conversations = await response.json();
      renderConversationList(conversations);

      // 如果有对话，加载最近的一个
      if (conversations.length > 0) {
        loadConversation(conversations[0].id);
      } else {
        // 否则创建新对话
        createNewConversation();
      }
    } catch (error) {
      console.error("加载对话列表错误:", error);
    }
  }

  // 渲染对话列表
  function renderConversationList(conversations) {
    historyList.innerHTML = "";

    conversations.forEach((conversation) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.dataset.id = conversation.id;

      // 格式化时间
      const date = new Date(conversation.modified_time);
      const formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      item.innerHTML = `
                <div class="title">${conversation.title}</div>
                <div class="time">${formattedTime}</div>
            `;

      item.addEventListener("click", () => {
        loadConversation(conversation.id);
      });

      historyList.appendChild(item);
    });
  }

  // 创建新对话
  async function createNewConversation() {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "新对话" }),
      });

      if (!response.ok) {
        throw new Error("创建对话失败");
      }

      const conversation = await response.json();
      currentConversationId = conversation.id;

      // 清空聊天区
      messageContainer.innerHTML = "";

      // 重新加载对话列表
      loadConversations();
    } catch (error) {
      console.error("创建新对话错误:", error);
    }
  }

  // 加载对话消息
  async function loadConversation(conversationId) {
    try {
      currentConversationId = conversationId;

      // 激活当前对话
      const items = document.querySelectorAll(".history-item");
      items.forEach((item) => {
        if (parseInt(item.dataset.id) === conversationId) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // 获取消息
      const response = await fetch(
        `/api/messages?conversation_id=${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("获取消息失败");
      }

      const messages = await response.json();

      // 渲染消息
      messageContainer.innerHTML = "";
      messages.forEach((message) => {
        renderMessage(message);
      });

      // 滚动到底部
      scrollToBottom();
    } catch (error) {
      console.error("加载对话错误:", error);
    }
  }

  // 发送消息
  async function sendMessage() {
    const content = userInput.value.trim();

    if (!content || !currentConversationId) {
      return;
    }

    // 清空输入框
    userInput.value = "";

    // 重置输入框高度
    userInput.style.height = "auto";
    inputBoxInner.style.height = "auto";

    try {
      // 渲染用户消息
      const userMessageEl = document.createElement("div");
      userMessageEl.className = "message user";
      userMessageEl.textContent = content;
      messageContainer.appendChild(userMessageEl);

      // 创建等待图标
      const waitingEl = document.createElement("div");
      waitingEl.className = "message bot";
      waitingEl.innerHTML = '<div class="loading-spinner"></div>';
      messageContainer.appendChild(waitingEl);

      // 滚动到底部
      scrollToBottom();

      // 禁用发送按钮
      sendBtn.disabled = true;

      // 发送消息到服务器
      const response = await fetch("/api/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversation_id: currentConversationId,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "发送消息失败");
      }

      const data = await response.json();

      // 移除等待图标
      messageContainer.removeChild(waitingEl);

      // 渲染助手回复
      renderMessage(data.assistantMessage);

      // 重新加载对话列表（用于更新标题）
      loadConversations();

      // 滚动到底部
      scrollToBottom();
    } catch (error) {
      console.error("发送消息错误:", error);
      alert(`发送消息失败: ${error.message}`);
    } finally {
      // 启用发送按钮
      sendBtn.disabled = false;
    }
  }

  // 渲染消息
  function renderMessage(message) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${message.role}`;

    if (message.role === "user") {
      messageEl.textContent = message.content;
    } else {
      // 使用marked渲染markdown内容
      const contentEl = document.createElement("div");
      contentEl.className = "content";
      contentEl.innerHTML = marked.parse(message.content);

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";

      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = "复制";
      copyBtn.appendChild(tooltip);

      copyBtn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(message.content)
          .then(() => {
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyBtn.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("复制失败:", err);
          });
      });

      messageEl.appendChild(contentEl);
      messageEl.appendChild(copyBtn);
    }

    messageContainer.appendChild(messageEl);
  }

  // 滚动到底部
  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // 打开用户中心弹窗
  function openConfigModal() {
    configModal.classList.remove("hidden");
    modalBackdrop.classList.remove("hidden");
  }

  // 关闭用户中心弹窗
  function closeConfigModal() {
    configModal.classList.add("hidden");
    modalBackdrop.classList.add("hidden");
  }

  // 事件监听
  sendBtn.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", (e) => {
    // 按下Enter发送，Shift+Enter换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 输入框自动调整高度
  userInput.addEventListener("input", () => {
    // 重置输入框高度
    userInput.style.height = "auto";
    if (userInput.value.length > 0) {
      userInput.style.height = userInput.scrollHeight + "px";
    }
  });

  newChatBtn.addEventListener("click", createNewConversation);

  userCenterBtn.addEventListener("click", openConfigModal);

  modalBackdrop.addEventListener("click", closeConfigModal);

  saveConfigBtn.addEventListener("click", saveUserConfig);

  // 初始化
  initialize();
});
