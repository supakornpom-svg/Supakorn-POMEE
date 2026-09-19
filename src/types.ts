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

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  targetMuscle: string;
  tip: string;
}

export interface WorkoutDayPlan {
  dayNumber: number;
  dayName: string;
  focus: string;
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high';
  isRestDay?: boolean;
  exercises: WorkoutExercise[];
  cardioAdvice?: string;
}

export interface WorkoutWeekPlan {
  weekNumber: number;
  phaseTitle: string;
  goalDescription: string;
  keyFocus: string[];
  days: WorkoutDayPlan[];
}

export interface SportWorkoutProgram {
  id: string;
  title: string;
  subtitle: string;
  targetCategory: string;
  level: 'เริ่มต้น' | 'ปานกลาง' | 'เข้มข้น';
  burnRating: number;
  weeklySchedule: WorkoutDayPlan[];
  monthlyPhases: WorkoutWeekPlan[];
  nutritionTips: {
    preWorkout: string;
    postWorkout: string;
    hydration: string;
    supplement: string;
  };
}

export interface AchievementData {
  title: string;
  subtitle: string;
  badgeName: string;
  mascotType: 'fit' | 'chubby' | 'both';
  record?: BmiRecord;
  completedActivity?: string;
  date: string;
}
