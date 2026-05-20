vue
<template>
  <view class="container">
    <view class="section">
      <text class="label">DeepSeek API Key</text>
      <input class="input" v-model="apiKey" placeholder="sk-xxxxxxxx" password />
      <text class="hint">密钥将安全存储在本地，不会上传到任何服务器</text>
    </view>

    <button class="save-btn" @click="saveKey">保存设置</button>

    <view class="section">
      <text class="label">使用说明</text>
      <text class="hint">1. 前往 platform.deepseek.com 注册并获取 API Key</text>
      <text class="hint">2. 粘贴到上方输入框并保存</text>
      <text class="hint">3. 返回对话页即可开始使用</text>
    </view>

    <view class="footer">
      <text>版本 1.0.0</text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        apiKey: ''
      };
    },
    onLoad() {
      this.apiKey = uni.getStorageSync('deepseek_api_key') || '';
    },
    methods: {
      saveKey() {
        if (!this.apiKey.trim()) {
          uni.showToast({ title: '请输入 API Key', icon: 'none' });
          return;
        }
        uni.setStorageSync('deepseek_api_key', this.apiKey.trim());
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    }
  };
</script>

<style>
  .container {
    padding: 30rpx;
    background: #f5f5f5;
    min-height: 100vh;
  }

  .section {
    background: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
  }

  .label {
    font-size: 30rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 20rpx;
  }

  .input {
    height: 80rpx;
    border: 1px solid #ddd;
    border-radius: 10rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    background: #f9f9f9;
  }

  .hint {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-top: 15rpx;
    line-height: 1.6;
  }

  .save-btn {
    width: 100%;
    height: 80rpx;
    background: #007aff;
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    line-height: 80rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .footer {
    text-align: center;
    color: #ccc;
    font-size: 24rpx;
    margin-top: 100rpx;
  }
</style>
