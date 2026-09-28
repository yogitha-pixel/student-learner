export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Event/Buffet';

export type WasteReason =
  | 'Cooked Too Much / Over-prepared'
  | 'Plate Waste (Leftovers on plate)'
  | 'Expired / Spoiled'
  | 'Expired / Overripe'
  | 'Expired / Stale'
  | 'Burnt / Cooking Error'
  | 'Taste / Quality Issue'
  | 'Prep Scraps / Peels'
  | 'Other';

export type FoodCategory =
  | 'Grains & Pasta'
  | 'Vegetables & Salads'
  | 'Fruits'
  | 'Dairy & Milk'
  | 'Meat & Proteins'
  | 'Bakery & Bread'
  | 'Soups & Sauces'
  | 'Beverages';

export type LoggedByRole = 'Student' | 'College Canteen';
export type WasteUnit = 'kg' | 'grams' | 'lbs' | 'servings';

export interface FoodWasteRecord {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: WasteUnit;
  quantityInKg: number;
  estimatedCost: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mealType: MealType;
  reason: string;
  loggedBy: LoggedByRole;
  notes?: string;
  createdAt: string;
}

export interface TopWastedFood {
  name: string;
  totalKg: number;
  count: number;
  totalCost: number;
  category: string;
  percentage: number;
}

export interface EnvironmentalImpact {
  co2eKg: number;
  waterLiters: number;
  mealsEquivalent: number;
}

export interface DailyTimelinePoint {
  date: string;
  dayName: string;
  kg: number;
}

export interface AnalyticsData {
  totalRecords: number;
  totalKgAllTime: number;
  totalCostAllTime: number;
  dailyWasteKg: number;
  weeklyWasteKg: number;
  monthlyWasteKg: number;
  prevWeekWasteKg: number;
  reductionPercent: number;
  topWastedFoods: TopWastedFood[];
  mostWastedItem: TopWastedFood | null;
  mealTypeKg: Record<string, number>;
  reasonBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  loggedByBreakdown: Record<string, number>;
  dailyTimeline: DailyTimelinePoint[];
  environmentalImpact: EnvironmentalImpact;
}

export interface SuggestionItem {
  title: string;
  category: string;
  impact: string;
  explanation: string;
}

export interface AISuggestionsResponse {
  summary: string;
  canteenSuggestions: SuggestionItem[];
  studentSuggestions: SuggestionItem[];
  actionPlan: string[];
}
