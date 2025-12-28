// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) return res.status(500).json({ error: '服务端未读取到 API Key' });

    const { prompt, isJson } = req.body;
    
    if (!prompt) return res.status(400).json({ error: 'Prompt is empty' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🔥 关键修改：换回 1.5 Flash
    // 之前报 404 是因为 Key 填反了，现在 Key 好了，这个模型一定能用！
    // 它是免费版里最快、限制最少的。
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("生成失败:", error);
    // 把 Google 的具体报错吐出来，方便调试
    return res.status(500).json({ error: error.message });
  }
}
