import React, { useState } from 'react';
import {
  PlusCircle,
  Utensils,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Building2,
  GraduationCap
} from 'lucide-react';
import { MealType, FoodCategory, LoggedByRole, WasteUnit, WasteReason } from '../types';

interface AddWasteFormProps {
  onRecordAdded: () => void;
  onNavigateHistory: () => void;
}

const COMMON_FOOD_SUGGESTIONS = [
  'Steamed White Rice',
  'Penne Marinara Pasta',
  'Dinner Rolls & Bread',
  'Mixed Green Salad',
  'Vegetable Curry',
  'Scrambled Eggs & Hashbrowns',
  'Banana & Fruit Slices',
  'Cheese Pizza',
  'Chicken & Rice Bowl',
  'Lentil Soup / Dal',
];

const CATEGORIES: FoodCategory[] = [
  'Grains & Pasta',
  'Vegetables & Salads',
  'Fruits',
  'Dairy & Milk',
  'Meat & Proteins',
  'Bakery & Bread',
  'Soups & Sauces',
  'Beverages',
];

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Event/Buffet'];

const REASONS: WasteReason[] = [
  'Cooked Too Much / Over-prepared',
  'Plate Waste (Leftovers on plate)',
  'Expired / Spoiled',
  'Expired / Overripe',
  'Expired / Stale',
  'Burnt / Cooking Error',
  'Taste / Quality Issue',
  'Prep Scraps / Peels',
  'Other',
];

export const AddWasteForm: React.FC<AddWasteFormProps> = ({
  onRecordAdded,
  onNavigateHistory,
}) => {
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Grains & Pasta');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<WasteUnit>('kg');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [reason, setReason] = useState<WasteReason>('Cooked Too Much / Over-prepared');
  const [loggedBy, setLoggedBy] = useState<LoggedByRole>('College Canteen');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-fill cost estimate based on quantity
  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      // Basic rate: ~$3.50 per kg or ~$0.0035 per gram
      let approxKg = num;
      if (unit === 'grams') approxKg = num / 1000;
      if (unit === 'lbs') approxKg = num * 0.453592;
      if (unit === 'servings') approxKg = num * 0.35;
      const calcCost = Math.round(approxKg * 3.5 * 100) / 100;
      if (!estimatedCost || parseFloat(estimatedCost) === 0) {
        setEstimatedCost(calcCost.toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!foodName.trim()) {
      setErrorMessage('Please enter a food name.');
      return;
    }

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMessage('Please enter a valid positive quantity.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: foodName.trim(),
          category,
          quantity: numQty,
          unit,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
          date,
          time,
          mealType,
          reason,
          loggedBy,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record food waste.');
      }

      setSuccessMessage(`Successfully logged ${foodName} (${numQty} ${unit})!`);
      // Reset form fields
      setFoodName('');
      setQuantity('');
      setEstimatedCost('');
      setNotes('');

      // Refresh parent data
      onRecordAdded();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add Food Waste Record
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Accurately log discarded food to identify waste patterns and save resources.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Banners */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={onNavigateHistory}
            className="text-emerald-700 underline font-bold hover:text-emerald-900"
          >
            View in History →
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Logged By Role Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Who is logging this waste? *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLoggedBy('College Canteen')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                loggedBy === 'College Canteen'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold">College Canteen / Staff</div>
                <div className="text-[10px] text-slate-400">Kitchen prep, buffet trays, over-cooking</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLoggedBy('Student')}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                loggedBy === 'Student'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold">Student</div>
                <div className="text-[10px] text-slate-400">Plate leftovers, dorm fridge spoilage</div>
              </div>
            </button>
          </div>
        </div>

        {/* Food Name & Quick Suggestions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Food Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Steamed White Rice, French Bread Rolls, Mixed Green Salad..."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
          />

          {/* Quick Suggestions Chips */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick Suggestions:</span>
            {COMMON_FOOD_SUGGESTIONS.slice(0, 5).map((food) => (
              <button
                key={food}
                type="button"
                onClick={() => setFoodName(food)}
                className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200/60 transition-colors"
              >
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity, Unit, and Estimated Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantity *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 2.5"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Unit *
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as WasteUnit)}
              className="w-full px-3 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-slate-800"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="grams">Grams (g)</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="servings">Portions / Servings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Estimated Cost ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-semibold text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Auto-estimated or enter custom value</span>
          </div>
        </div>

        {/* Meal Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Meal Type *
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full px-3 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-slate-800"
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Food Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
              className="w-full px-3 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-slate-800"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason for Waste */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Waste *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as WasteReason)}
            className="w-full px-3 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-slate-800"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Observations / Root Cause Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Overestimated attendance after morning exams; cooked secondary batch too late in the service..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onNavigateHistory}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            View History
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-sm font-extrabold shadow-md shadow-emerald-200 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving Log...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Save Waste Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
