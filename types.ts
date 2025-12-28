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
  
  isCompleted?: boolean; // Added for Todo functionality in Matrix
}

export interface ZoneItem {
  id: string;
  content: string;
  createdAt: number;
  isCompleted?: boolean; 
  completedAt?: number;
  aiActionPlan?: string;
  sourceMatrixId?: string; // Link back to matrix task if applicable
}

export interface DashboardData {
  matrix_tasks: Task[]; // Persist matrix tasks
  zone1_inspiration: ZoneItem[]; // Was work inspiration
  zone2_work: ZoneItem[]; // Was strategy (now list)
  zone3_birthdate: string;
  zone4_knowledge: ZoneItem[];
  zone5_misc: ZoneItem[];
  zone6_thinking: ZoneItem[];
}

export enum AppTab {
  MATRIX = 'matrix',
  DASHBOARD = 'dashboard',
  REVIEW = 'review'
}