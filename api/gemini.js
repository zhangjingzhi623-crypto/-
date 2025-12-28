// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 跨域设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. 关键修改：加了 .trim() 去除多余空格
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      console.error("API Key is missing or empty");
      return res.status(500).json({ error: 'Config Error: API Key is missing' });
    }

    // 3. 打印 Key 的前几位，方便在 Vercel 日志里调试 (不会泄露全名)
    console.log("Using Key starting with:", apiKey.substring(0, 5) + "...");

    const { prompt, isJson } = req.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 4. 使用更稳定的模型别名
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        model: "gemini-1.5-flash-latest", // 这里的名字改了一下
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    // 5. 打印详细错误到 Vercel 日志
    console.error("Gemini API Error:", error);
    
    // 如果是 404，提示用户可能是模型名字或者是 Key 的问题
    if (error.message.includes('404')) {
        return res.status(500).json({ error: 'Google 报 404: 可能是 Key 多了空格，或模型名称不对' });
    }
    
    return res.status(500).json({ error: error.message });
  }
}
