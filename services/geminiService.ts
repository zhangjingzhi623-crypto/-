// 修改后的前端代码：不再直接连 Google，而是连 api/gemini
import { Task } from "../types";

// --- 通用的发送工具 ---
async function callGeminiAPI(prompt: string, isJson: boolean = false) {
  try {
    const response = await fetch('/api/gemini', { // 请求刚才建立的 api/gemini.js
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, isJson })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("AI调用失败:", error);
    return "";
  }
}

// 1. 分析任务矩阵
export const analyzeTasks = async (tasks: Task[]): Promise<string> => {
  if (tasks.length === 0) return "矩阵目前是空的。";

  const taskSummary = tasks.filter(t => !t.isCompleted).map(t => 
    `- ${t.title}: 重要性=${t.importanceScore.toFixed(1)}, 容易度=${t.easeScore.toFixed(1)}`
  ).join('\n');

  const prompt = `
    作为时间管理专家，请分析以下任务矩阵（忽略已完成）：
    ${taskSummary}
    
    请简明扼要地给出：
    1. 速赢项目（立即做）
    2. 重大项目（需拆解）
    3. 建议放弃或延后的项目
    请用中文。
  `;

  const result = await callGeminiAPI(prompt);
  return result || "AI 暂时不可用。";
};

// 2. 生成执行方案
export const generateActionPlan = async (inspiration: string): Promise<string> => {
  const prompt = `
    为灵感 "${inspiration}" 生成落地执行方案。
    要求：3-5个步骤，第一步需符合5分钟启动法。中文回答。
  `;

  const result = await callGeminiAPI(prompt);
  return result || "生成失败。";
};

// 3. 评估任务属性 (JSON)
export const evaluateTaskAttributes = async (title: string): Promise<Partial<Task>> => {
  const prompt = `
    Evaluate the task "${title}" on a scale of 1-10 for: Benefit, Impact, Diffusion, TimeEfficiency, Simplicity.
    Return ONLY a JSON object like: {"benefit": 8, "impact": 5, "diffusion": 4, "timeEfficiency": 6, "simplicity": 7}
  `;

  // 第二个参数 true 表示告诉后端我们要 JSON
  const jsonString = await callGeminiAPI(prompt, true); 

  try {
    if (!jsonString) return {};
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON解析失败:", error);
    return {};
  }
};

// 4. 任务分类
export const classifyTaskCategory = async (title: string): Promise<string> => {
  const prompt = `
    Classify the task "${title}" into one of these 4 categories:
    - "zone1_inspiration"
    - "zone2_work"
    - "zone4_knowledge"
    - "zone5_misc"
    Return ONLY the category string.
  `;

  const result = await callGeminiAPI(prompt);
  const text = result?.trim();
  
  const validZones = ['zone1_inspiration', 'zone2_work', 'zone4_knowledge', 'zone5_misc'];
  if (text && validZones.includes(text)) {
    return text;
  }
  return 'zone2_work';
};
