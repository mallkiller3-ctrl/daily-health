
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  id: string;
  type: MealType;
  name: string;
  calories: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  durationMinutes: number;
  reps?: number;
  sets?: number;
}

export interface DailyLog {
  date: string; // ISO format YYYY-MM-DD
  weight: number;
  sleepHours: number;
  meals: FoodEntry[];
  exercises: ExerciseEntry[];
  skincare: {
    morning: boolean;
    evening: boolean;
  };
  mounjaroDose: boolean;
  mounjaroNotes: string;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  height: number;
  currentWeight: number;
  targetWeight: number;
  phase: 'diet' | 'maintenance';
  mounjaroActive: boolean;
  mounjaroStartDate?: string;
}

export interface BodyCheckPhoto {
  id: string;
  date: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
