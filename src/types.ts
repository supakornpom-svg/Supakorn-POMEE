export type BmiCategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese1'
  | 'obese2';

export interface BmiRecord {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  weight: number; // in kg
  height: number; // in cm
  bmi: number;
  category: BmiCategory;
  categoryLabelTh: string;
  categoryColor: string;
  idealWeightMin: number;
  idealWeightMax: number;
  bmr: number;
  tdee: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_weight';
  createdAt: string;
  lineNotificationStatus?: 'sent' | 'failed' | 'not_configured';
  aiRecommendation?: AiHealthPlan;
  notes?: string;
}

export interface AiHealthPlan {
  summary: string;
  calorieTarget: number;
  dietAdvice: {
    title: string;
    focus: string[];
    avoid: string[];
    sampleMeals: {
      breakfast: string;
      lunch: string;
      dinner: string;
      snack?: string;
    };
  };
  exerciseAdvice: {
    title: string;
    weeklyFrequency: string;
    cardio: string;
    strength: string;
    cautions: string;
  };
  keyTakeaways: string[];
}

export interface LineSettings {
  isConfigured: boolean;
  tokenMasked?: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestMessage?: string;
}

export interface DatabaseStats {
  total: number;
  avgBmi: number;
  categories: {
    underweight: number;
    normal: number;
    overweight: number;
    obese1: number;
    obese2: number;
  };
}
