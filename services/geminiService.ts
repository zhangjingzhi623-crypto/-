import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeTasks = async (tasks: Task[]): Promise<string> => {
  if (!apiKey) return "请配置 API Key。";
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "无建议。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 暂时不可用。";
  }
};

export const generateActionPlan = async (inspiration: string): Promise<string> => {
  if (!apiKey) return "请配置 API Key。";

  const prompt = `
    为灵感 "${inspiration}" 生成落地执行方案。
    要求：3-5个步骤，第一步需符合5分钟启动法。中文回答。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "无方案。";
  } catch (error) {
    return "生成失败。";
  }
};

export const evaluateTaskAttributes = async (title: string): Promise<Partial<Task>> => {
  if (!apiKey) return {};

  const prompt = `
    Evaluate the task "${title}" on a scale of 1-10 for the following attributes:
    1. Benefit (How beneficial is it?)
    2. Impact (How wide is the impact?)
    3. Diffusion (Does it lead to other successes?)
    4. TimeEfficiency (10 = Very Quick/Short time, 1 = Very Long)
    5. Simplicity (10 = Very Easy/Low Skill, 1 = Very Hard)

    Return ONLY a JSON object like: {"benefit": 8, "impact": 5, "diffusion": 4, "timeEfficiency": 6, "simplicity": 7}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {};
  }
};

export const classifyTaskCategory = async (title: string): Promise<string> => {
  if (!apiKey) return 'zone2_work'; // Default to work

  const prompt = `
    Classify the task "${title}" into one of these 4 categories:
    - "zone1_inspiration" (Ideation, creative sparks, vague ideas)
    - "zone2_work" (Concrete work tasks, projects, strategy execution)
    - "zone4_knowledge" (Reading, learning, research)
    - "zone5_misc" (Errands, chores, shopping, health)

    Return ONLY the category string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    const result = response.text?.trim();
    const validZones = ['zone1_inspiration', 'zone2_work', 'zone4_knowledge', 'zone5_misc'];
    if (result && validZones.includes(result)) {
      return result;
    }
    return 'zone2_work';
  } catch (error) {
    return 'zone2_work';
  }
};