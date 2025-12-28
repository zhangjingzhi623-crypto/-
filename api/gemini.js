// api/gemini.js
// 这是一个纯 JavaScript 文件，Vercel 可以直接运行
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 设置跨域 (CORS)
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
    // 2. 获取并清理 Key
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      console.error("API Key 未配置");
      return res.status(500).json({ error: '服务端未配置 API Key' });
    }

    // 3. 接收前端数据
    const { prompt, isJson } = req.body;
    
    // 4. 初始化模型
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 使用 gemini-1.5-flash-001 (这是目前最稳的版本号)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-001",
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    // 5. 生成内容
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 6. 返回结果
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // 友好的错误提示
    let errorMessage = error.message;
    if (errorMessage.includes('404')) {
        errorMessage = '模型未找到 (404)，请检查模型名称是否正确';
    } else if (errorMessage.includes('403') || errorMessage.includes('API key')) {
        errorMessage = 'API Key 无效或无权限';
    }

    return res.status(500).json({ error: errorMessage });
  }
}
