javascript
const API_BASE = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 流式调用 DeepSeek API
 * @param {string} apiKey 
 * @param {Array} messages - 完整对话历史
 * @param {Function} onChunk - 每收到一个文字片段就回调
 */
export function sendMessageToDeepSeek(apiKey, messages, onChunk) {
  return new Promise((resolve, reject) => {
    // 过滤掉内容为空的消息（AI 占位消息）
    const validMessages = messages.filter(m => m.content && m.content.trim() !== '');
    
    const task = uni.request({
      url: API_BASE,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        model: 'deepseek-chat',
        messages: validMessages,
        stream: true
      },
      enableChunked: true,  // 关键：开启分块传输
      responseType: 'text',
      success: () => {},
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });

    // 监听分块数据
    task.onChunkReceived((chunk) => {
      const text = typeof chunk.data === 'string' ? chunk.data : 
                   new TextDecoder().decode(chunk.data);
      
      // 解析 SSE 数据流
      const lines = text.split('\n').filter(line => line.startsWith('data: '));
      for (const line of lines) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') {
          resolve();
          return;
        }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // 忽略解析失败的行
        }
      }
    });

    // 请求完成的兜底
    const checkComplete = setInterval(() => {
      // uni-app 的流式请求在 onChunkReceived 结束后自动完成
    }, 100);
  });
}
