// api/gemini.js
// 这是一个通用的 OpenAI 格式接口，完美支持 DeepSeek、Kimi、通义千问等国内模型
// 不需要安装任何 npm 包，纯原生 fetch 实现

export const config = {
  runtime: 'edge', // 启用 Edge 运行时，速度更快
};

export default async function handler(req) {
  // 1. 处理跨域 (让你的网站能访问)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // 2. 读取 DeepSeek 的 Key
    // 注意：这里用的是你刚才新加的变量名 DEEPSEEK_API_KEY
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '服务端未配置 DeepSeek API Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 解析前端发来的数据
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 向 DeepSeek 发起请求 (原生 fetch)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek V3 模型
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    // 5. 处理 DeepSeek 返回的结果
    const data = await response.json();

    // 如果 DeepSeek 报错了
    if (data.error) {
      console.error("DeepSeek Error:", data.error);
      throw new Error(data.error.message);
    }

    // 提取回答文本
    const answer = data.choices[0].message.content;

    // 6. 返回给你的前端 (保持格式与之前兼容)
    // 前端只要 { text: "..." }，我们这里就给它拼好
    return new Response(JSON.stringify({ text: answer }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
