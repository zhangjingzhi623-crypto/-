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

    // 日志标记
    console.log("正在尝试运行 gemini-2.0-flash-exp (实验版测试)");

    const { prompt, isJson } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is empty' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 关键修改：使用 2.0 实验版
    // 根据你的列表，这个模型存在 (gemini-2.0-flash-exp)
    // 且通常拥有独立的免费测试额度
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp", 
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Error:", error);
    // 如果这个还不行，我们只能试 gemini-flash-latest 了
    return res.status(500).json({ error: error.message });
  }
}
