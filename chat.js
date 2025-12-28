// 这是一个 Vercel Serverless Function
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. 处理跨域问题 (允许你的前端访问)
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

  // 2. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 3. 从前端获取用户输入
    const { message } = req.body;

    // 4. 调用 Gemini (Key 保存在服务器环境变量中，安全！)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 5. 返回结果给前端
    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error generating content' });
  }
}
