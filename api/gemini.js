// api/gemini.js
// 这是一个 Vercel Serverless Function
// 它的作用是替你的前端去请求 Google，从而隐藏 API Key

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 设置跨域允许 (让你的前端能连上)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 获取 Vercel 环境变量里的 Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key 未配置' });
  }

  try {
    // 3. 接收前端发来的 Prompt
    const { prompt, isJson } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // 使用稳定且免费的模型
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // 如果前端要求 JSON，这里强制开启 JSON 模式
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. 把结果传回给前端
    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'AI 服务出错' });
  }
}
