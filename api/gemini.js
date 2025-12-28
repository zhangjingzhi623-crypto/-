// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 跨域设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) return res.status(500).json({ error: '服务端未读取到 API Key' });

    // 日志标记：确认运行的是 Latest 版本
    console.log("正在尝试运行 gemini-flash-latest (自动路由版)");

    const { prompt, isJson } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is empty' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 关键修改：使用 gemini-flash-latest
    // 这是一个永久有效的别名，它会自动寻找你有权访问的那个 Flash 模型
    // 从而避开具体版本号的 404 或 429 问题
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest", 
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
