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

    // 🔥 强制刷新标记：请在日志里找这句话！
    console.log("正在尝试运行 gemini-1.5-flash (版本: 2025-12-28 修复版)");

    const { prompt, isJson } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is empty' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 确认这里写的是 1.5-flash
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
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
