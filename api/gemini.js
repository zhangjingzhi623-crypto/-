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

    const { prompt, isJson } = req.body;
    
    // 如果前端发来的 prompt 是空的，做个保护
    if (!prompt) return res.status(400).json({ error: 'Prompt is empty' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 关键修改：使用你列表里存在的、稳定的 2.0 版本
    // 根据你的日志，这个模型是 "Stable version ... released in January of 2025"
    const modelName = "gemini-2.0-flash-001"; 

    const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("生成失败:", error);
    return res.status(500).json({ error: error.message });
  }
}
