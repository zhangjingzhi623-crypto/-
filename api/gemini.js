// api/gemini.js
// 使用 Node.js 运行时，兼容性最强，连接 DeepSeek
export default async function handler(req, res) {
  // 1. 设置跨域 (允许你的新域名访问)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. 读取 DeepSeek Key
    // 务必确认 Vercel 环境变量里配的是 DEEPSEEK_API_KEY
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error("服务端报错: 找不到 DEEPSEEK_API_KEY");
      return res.status(500).json({ error: '服务端未配置 API Key' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is empty' });
    }

    console.log("正在请求 DeepSeek...");

    // 3. 发送请求给 DeepSeek
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", 
        messages: [
          { role: "user", content: prompt }
        ],
        stream: false
      })
    });

    // 4. 处理结果
    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek 报错:", data);
      throw new Error(data.error?.message || "DeepSeek API Error");
    }

    const answer = data.choices[0].message.content;

    // 5. 返回给前端
    return res.status(200).json({ text: answer });

  } catch (error) {
    console.error("API 调用失败:", error);
    return res.status(500).json({ error: error.message });
  }
}
