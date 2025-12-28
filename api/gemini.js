// api/gemini.js - 诊断模式
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  try {
    // 🔍 诊断动作：直接请求 Google 列出所有可用模型
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    const data = await response.json();

    if (data.error) {
      console.error("查询模型列表失败:", data.error);
      return res.status(500).json({ error: JSON.stringify(data.error) });
    }

    // 打印到 Vercel 日志
    console.log("✅ 你的账号可用模型列表:", JSON.stringify(data.models, null, 2));

    // 同时也返回给前端看
    return res.status(200).json({ 
      text: "诊断完成！请查看 Vercel Logs，或者看下面列出的可用模型：",
      debugInfo: data.models 
    });

  } catch (error) {
    console.error("诊断请求炸了:", error);
    return res.status(500).json({ error: error.message });
  }
}
