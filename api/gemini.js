// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 跨域设置 (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. 读取 Key (此时你的 Vercel 设置是对的，这里肯定能读到了)
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    
    // 如果万一没读到，给个提示
    if (!apiKey) return res.status(500).json({ error: 'API Key 未能在服务端读取到' });

    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 关键修改：使用 'gemini-pro'
    // 这个模型几乎所有账号都能直接用，不会报 404
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
