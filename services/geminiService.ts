import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeTasks = async (tasks: Task[]): Promise<string> => {
  if (!apiKey) {
    return "Please configure your API Key to use the AI Strategist feature.";
  }

  if (tasks.length === 0) {
    return "Your matrix is empty. Add some tasks to get advice!";
  }

  const taskSummary = tasks.map(t => 
    `- ${t.title}: Importance=${t.importanceScore.toFixed(1)}, Ease=${t.easeScore.toFixed(1)}`
  ).join('\n');

  const prompt = `
    You are a Productivity Strategist expert based on the "Strategist Time Matrix" (策略师时间矩阵).
    
    The Core Principles are:
    1. Do Important AND Easy things first (Top-Right Quadrant).
    2. Break down Important but Hard things (Top-Left Quadrant) into smaller, easier steps (2-minute rule, 5-minute rule).
    3. Avoid Low Importance tasks unless they are fillers.

    Here is the user's current task list with scores (1-10 scale):
    ${taskSummary}

    Please provide a concise, actionable analysis:
    1. Identify the "Quick Wins" (High Importance, High Ease) they should do immediately.
    2. Identify "Major Projects" (High Importance, Low Ease) and suggest a way to break one of them down.
    3. Point out any distractions (Low Importance).
    
    Keep the tone encouraging but strategic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to connect to the AI Strategist. Please try again later.";
  }
};