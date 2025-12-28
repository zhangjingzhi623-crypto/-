export interface Task {
  id: string;
  title: string;
  // Importance Factors (1-10)
  benefit: number;
  impact: number;
  diffusion: number;
  // Easiness Factors (1-10)
  timeEfficiency: number; // 10 = Very Quick, 1 = Very Long
  simplicity: number; // 10 = Very Easy, 1 = Very Hard
  
  // Computed
  importanceScore: number;
  easeScore: number;
}

export interface ZoneItem {
  id: string;
  content: string;
  createdAt: number;
}

export interface DashboardData {
  zone1_work: ZoneItem[];
  zone2_strategy: string; // Text block
  zone3_birthdate: string; // ISO Date string
  zone4_knowledge: ZoneItem[];
  zone5_misc: ZoneItem[];
  zone6_thinking: ZoneItem[];
}

export enum AppTab {
  MATRIX = 'matrix',
  DASHBOARD = 'dashboard'
}