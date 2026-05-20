vue
<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">DeepSeek 助手</text>
      <button class="new-chat-btn" @click="clearChat" size="mini">新对话</button>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="chat-list" scroll-y :scroll-top="scrollTop" :scroll-with-animation="true">
      <view v-if="messages.length === 0" class="empty-tip">
        <text>👋 你好！我是 DeepSeek，开始提问吧</text>
      </view>
      <view v-for="(msg, index) in messages" :key="index" class="message-wrapper"
        :class="msg.role === 'user' ? 'user-wrapper' : 'ai-wrapper'">
        <view class="message-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'">
          <text>{{ msg.content }}</text>
        </view>
      </view>
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-wrapper">
        <view class="ai-bubble loading-bubble">
          <text class="loading-text">思考中</text>
          <view class="dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区 -->
    <view class="input-area">
      <input class="input-box" v-model="inputText" placeholder="输入你的问题..." 
        :disabled="isLoading" confirm-type="send" @confirm="sendMessage" />
      <button class="send-btn" @click="sendMessage" :disabled="isLoading || !inputText.trim()">
        发送
      </button>
    </view>
  </view>
</template>

<script>
  import { sendMessageToDeepSeek } from '@/utils/api.js';

  export default {
    data() {
      return {
        inputText: '',
        messages: [],
        isLoading: false,
        scrollTop: 0,
        apiKey: ''
      };
    },
    onLoad() {
      this.apiKey = uni.getStorageSync('deepseek_api_key') || '';
      if (!this.apiKey) {
        uni.showModal({
          title: '提示',
          content: '请先设置 API Key',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/settings/settings' });
            }
          }
        });
      }
    },
    methods: {
      async sendMessage() {
        const content = this.inputText.trim();
        if (!content || this.isLoading) return;
        if (!this.apiKey) {
          uni.showToast({ title: '请先设置 API Key', icon: 'none' });
          return;
        }

        // 添加用户消息
        this.messages.push({ role: 'user', content });
        this.inputText = '';
        this.scrollToBottom();
        this.isLoading = true;

        // 准备 AI 消息占位
        const aiMsgIndex = this.messages.length;
        this.messages.push({ role: 'assistant', content: '' });

        try {
          await sendMessageToDeepSeek(
            this.apiKey,
            this.messages.filter(m => m.content !== ''),
            (chunk) => {
              // 流式更新 AI 回复
              this.messages[aiMsgIndex].content += chunk;
              this.scrollToBottom();
            }
          );
        } catch (e) {
          this.messages[aiMsgIndex].content = `错误: ${e.message || '请求失败，请检查 API Key 和网络'}`;
          uni.showToast({ title: '请求失败', icon: 'error' });
        } finally {
          this.isLoading = false;
          this.scrollToBottom();
        }
      },

      clearChat() {
        uni.showModal({
          title: '确认',
          content: '确定要清空当前对话吗？',
          success: (res) => {
            if (res.confirm) {
              this.messages = [];
            }
          }
        });
      },

      scrollToBottom() {
        this.$nextTick(() => {
          this.scrollTop = 99999;
        });
      }
    }
  };
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f5f5;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    background: #fff;
    border-bottom: 1px solid #eee;
  }

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .chat-list {
    flex: 1;
    padding: 20rpx;
  }

  .empty-tip {
    text-align: center;
    color: #999;
    margin-top: 200rpx;
  }

  .message-wrapper {
    margin-bottom: 30rpx;
    display: flex;
  }

  .user-wrapper {
    justify-content: flex-end;
  }

  .ai-wrapper {
    justify-content: flex-start;
  }

  .message-bubble {
    max-width: 75%;
    padding: 20rpx 30rpx;
    border-radius: 20rpx;
    font-size: 30rpx;
    line-height: 1.6;
    word-break: break-all;
  }

  .user-bubble {
    background: #007aff;
    color: #fff;
    border-bottom-right-radius: 8rpx;
  }

  .ai-bubble {
    background: #fff;
    color: #333;
    border-bottom-left-radius: 8rpx;
  }

  .loading-wrapper {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 30rpx;
  }

  .loading-bubble {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 20rpx 40rpx;
  }

  .loading-text {
    color: #999;
    margin-right: 10rpx;
  }

  .dots {
    display: flex;
    gap: 8rpx;
  }

  .dot {
    width: 12rpx;
    height: 12rpx;
    background: #999;
    border-radius: 50%;
    animation: blink 1.4s infinite;
  }

  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }

  .input-area {
    display: flex;
    padding: 20rpx;
    background: #fff;
    border-top: 1px solid #eee;
    gap: 10rpx;
  }

  .input-box {
    flex: 1;
    height: 70rpx;
    border: 1px solid #ddd;
    border-radius: 35rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    background: #f5f5f5;
  }

  .send-btn {
    width: 120rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: #007aff;
    color: #fff;
    border-radius: 35rpx;
    font-size: 28rpx;
    text-align: center;
    padding: 0;
  }
</style>
