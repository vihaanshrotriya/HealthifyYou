import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FOOD_DATABASE, FoodItem } from '../data/foodDatabase';
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Heart,
  Droplet,
  Search,
  X,
  Info,
  ChevronRight
} from 'lucide-react';

interface MealsTabProps {
  userProfile: {
    name: string;
    email: string;
    height: number;
    weight: number;
    dob: string;
    gender: string;
    activityLevel: string;
    goal: string;
    targetCalories: number;
    dailyCalories?: number; // optional alias
    macros: { p: number; c: number; f: number };
    waterGoal: number;
    streak: number;
    onboardingComplete: boolean;
  };
  setCaloriesConsumed: (cals: number) => void;
  setHydrationConsumed: (liters: number) => void;
}

export default function MealsTab({ userProfile, setCaloriesConsumed, setHydrationConsumed }: MealsTabProps) {
  // Helper to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 1. Core States
  const [selectedMealDate, setSelectedMealDate] = useState(() => formatDateToYYYYMMDD(new Date()));
  const [mealsViewMode, setMealsViewMode] = useState<'tracker' | 'weekly'>('tracker');

  // Meal history structure keyed by YYYY-MM-DD
  const [mealHistory, setMealHistory] = useState<Record<string, any>>(() => {
    const stored = localStorage.getItem('mealHistory');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed parsing mealHistory", e);
      }
    }
    return {};
  });

  // Custom foods saved in localStorage
  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => {
    const stored = localStorage.getItem('customFoods');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed parsing customFoods", e);
      }
    }
    return [];
  });

  // Favorite food IDs
  const [favoriteFoods, setFavoriteFoods] = useState<string[]>(() => {
    const stored = localStorage.getItem('favoriteFoods');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed parsing favoriteFoods", e);
      }
    }
    return [];
  });

  // Recent foods (stores last 10 logged items)
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>(() => {
    const stored = localStorage.getItem('recentFoods');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed parsing recentFoods", e);
      }
    }
    return [];
  });

  // Add food modal states
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner' | null>(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<FoodItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [customPortionInput, setCustomPortionInput] = useState('');
  const [isCustomFoodFormActive, setIsCustomFoodFormActive] = useState(false);

  // Custom food form inputs
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCalories, setCustomFoodCalories] = useState('');
  const [customFoodProtein, setCustomFoodProtein] = useState('');
  const [customFoodCarbs, setCustomFoodCarbs] = useState('');
  const [customFoodFats, setCustomFoodFats] = useState('');
  const [customFoodFiber, setCustomFoodFiber] = useState('');
  const [customFoodServingSize, setCustomFoodServingSize] = useState('100');
  const [customFoodServingUnit, setCustomFoodServingUnit] = useState('g');

  // Custom water intake input
  const [customWaterInput, setCustomWaterInput] = useState('');

  // 2. Persists states to localStorage
  useEffect(() => {
    localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
  }, [mealHistory]);

  useEffect(() => {
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
  }, [customFoods]);

  useEffect(() => {
    localStorage.setItem('favoriteFoods', JSON.stringify(favoriteFoods));
  }, [favoriteFoods]);

  useEffect(() => {
    localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
  }, [recentFoods]);

  // Target values derived from user profile
  const targetCalories = userProfile.dailyCalories || userProfile.targetCalories || 2200;
  const targetMacros = userProfile.macros || { p: 165, c: 248, f: 61 };
  const targetWaterMl = (userProfile.waterGoal || 2.5) * 1000;

  // Selected date log
  const activeDateLog = mealHistory[selectedMealDate] || {
    breakfast: [],
    morningSnack: [],
    lunch: [],
    eveningSnack: [],
    dinner: [],
    water: 0
  };

  // Calculates totals for the selected date
  const mealKeys = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'] as const;
  let consumedCals = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFats = 0;
  let consumedFiber = 0;

  mealKeys.forEach(slot => {
    const list = activeDateLog[slot] || [];
    list.forEach((item: any) => {
      consumedCals += Math.round(item.calories * item.portionMultiplier);
      consumedProtein += item.protein * item.portionMultiplier;
      consumedCarbs += item.carbs * item.portionMultiplier;
      consumedFats += item.fats * item.portionMultiplier;
      consumedFiber += item.fiber * item.portionMultiplier;
    });
  });

  consumedProtein = Math.round(consumedProtein * 10) / 10;
  consumedCarbs = Math.round(consumedCarbs * 10) / 10;
  consumedFats = Math.round(consumedFats * 10) / 10;
  consumedFiber = Math.round(consumedFiber * 10) / 10;

  const remainingCalories = targetCalories - consumedCals;
  const pct = targetCalories > 0 ? (consumedCals / targetCalories) * 100 : 0;

  // 3. Sync to Parent Dashboard
  useEffect(() => {
    setCaloriesConsumed(consumedCals);
    setHydrationConsumed((activeDateLog.water || 0) / 1000);
  }, [consumedCals, activeDateLog.water, setCaloriesConsumed, setHydrationConsumed]);

  // Helper functions
  const handlePrevDay = () => {
    const d = new Date(selectedMealDate);
    d.setDate(d.getDate() - 1);
    setSelectedMealDate(formatDateToYYYYMMDD(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedMealDate);
    d.setDate(d.getDate() + 1);
    setSelectedMealDate(formatDateToYYYYMMDD(d));
  };

  const handleSetToday = () => {
    setSelectedMealDate(formatDateToYYYYMMDD(new Date()));
  };

  const getMealSlotCalories = (slot: 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner') => {
    const list = activeDateLog[slot] || [];
    return list.reduce((sum: number, item: any) => sum + Math.round(item.calories * item.portionMultiplier), 0);
  };

  const logFoodToMeal = (food: FoodItem, slot: 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner', multiplier: number) => {
    const dateKey = selectedMealDate;
    
    const loggedItem = {
      loggedId: `logged_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      id: food.id,
      name: food.name,
      category: food.category,
      calories: Number(food.calories),
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fats: Number(food.fats) || 0,
      fiber: Number(food.fiber) || 0,
      servingSize: Number(food.servingSize) || 100,
      servingUnit: food.servingUnit || 'g',
      portionMultiplier: multiplier
    };

    setMealHistory(prev => {
      const currentDayLog = prev[dateKey] || {
        breakfast: [],
        morningSnack: [],
        lunch: [],
        eveningSnack: [],
        dinner: [],
        water: 0
      };
      
      const updatedSlot = [...(currentDayLog[slot] || []), loggedItem];
      
      return {
        ...prev,
        [dateKey]: {
          ...currentDayLog,
          [slot]: updatedSlot
        }
      };
    });

    // Add to recent foods
    setRecentFoods(prev => {
      const filtered = prev.filter(item => item.id !== food.id);
      const updated = [
        {
          id: food.id,
          name: food.name,
          category: food.category,
          calories: Number(food.calories),
          protein: Number(food.protein) || 0,
          carbs: Number(food.carbs) || 0,
          fats: Number(food.fats) || 0,
          fiber: Number(food.fiber) || 0,
          servingSize: Number(food.servingSize) || 100,
          servingUnit: food.servingUnit || 'g'
        },
        ...filtered
      ];
      return updated.slice(0, 10);
    });
  };

  const deleteFoodFromMeal = (slot: 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner', loggedId: string) => {
    const dateKey = selectedMealDate;
    setMealHistory(prev => {
      const currentDayLog = prev[dateKey];
      if (!currentDayLog) return prev;
      
      const updatedSlot = (currentDayLog[slot] || []).filter((item: any) => item.loggedId !== loggedId);
      
      return {
        ...prev,
        [dateKey]: {
          ...currentDayLog,
          [slot]: updatedSlot
        }
      };
    });
  };

  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoods(prev => {
      if (prev.includes(foodId)) {
        return prev.filter(id => id !== foodId);
      } else {
        return [...prev, foodId];
      }
    });
  };

  // Water click handler
  const handleWaterGlassClick = (index: number) => {
    const dateKey = selectedMealDate;
    const currentDayLog = mealHistory[dateKey] || {
      breakfast: [],
      morningSnack: [],
      lunch: [],
      eveningSnack: [],
      dinner: [],
      water: 0
    };
    const currentGlasses = Math.floor((currentDayLog.water || 0) / 250);
    const targetGlasses = index + 1;
    
    let newWater = currentDayLog.water || 0;
    if (targetGlasses === currentGlasses) {
      newWater = Math.max(0, (currentGlasses - 1) * 250);
    } else {
      newWater = targetGlasses * 250;
    }
    
    setMealHistory(prev => {
      const log = prev[dateKey] || {
        breakfast: [],
        morningSnack: [],
        lunch: [],
        eveningSnack: [],
        dinner: [],
        water: 0
      };
      return {
        ...prev,
        [dateKey]: {
          ...log,
          water: newWater
        }
      };
    });
  };

  const handleAddCustomWater = () => {
    const ml = parseInt(customWaterInput);
    if (!isNaN(ml) && ml > 0) {
      const dateKey = selectedMealDate;
      setMealHistory(prev => {
        const log = prev[dateKey] || {
          breakfast: [],
          morningSnack: [],
          lunch: [],
          eveningSnack: [],
          dinner: [],
          water: 0
        };
        return {
          ...prev,
          [dateKey]: {
            ...log,
            water: (log.water || 0) + ml
          }
        };
      });
      setCustomWaterInput('');
    }
  };

  // Weekly View calculations
  const getWeeklyChartData = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = formatDateToYYYYMMDD(d);
      
      const dayLog = mealHistory[dateStr] || { breakfast: [], morningSnack: [], lunch: [], eveningSnack: [], dinner: [], water: 0 };
      let totalCal = 0;
      const slots = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'] as const;
      slots.forEach(slot => {
        const list = dayLog[slot] || [];
        list.forEach((item: any) => {
          totalCal += Math.round(item.calories * item.portionMultiplier);
        });
      });
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      result.push({
        dateStr,
        dayName,
        displayLabel,
        calories: totalCal
      });
    }
    return result;
  };

  const weeklyChartData = getWeeklyChartData();
  const chartMaxCal = Math.max(
    targetCalories * 1.2,
    ...weeklyChartData.map(d => d.calories)
  );

  return (
    <div id="meals-tracker-container" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER with segmented toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Nutritional Command</h2>
          <p className="text-xs text-gray-500">Calculate calorie density and track custom, micro-balanced meals</p>
        </div>
        
        {/* Daily vs Weekly View Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setMealsViewMode('tracker')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mealsViewMode === 'tracker' ? 'bg-[#00C853] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Daily Tracker
          </button>
          <button
            onClick={() => setMealsViewMode('weekly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${mealsViewMode === 'weekly' ? 'bg-[#00C853] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Weekly View
          </button>
        </div>
      </div>

      {/* 2. CORE CONTAINER */}
      {mealsViewMode === 'tracker' ? (
        <div className="space-y-6">
          {/* Date Selector Navigation Bar */}
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-gray-150 rounded-lg text-gray-500 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="text-xs font-extrabold text-gray-800 min-w-[120px] text-center font-mono">
                {selectedMealDate === formatDateToYYYYMMDD(new Date()) ? 'Today, ' : ''}
                {new Date(selectedMealDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={handleNextDay}
                className="p-1.5 hover:bg-gray-150 rounded-lg text-gray-500 transition-colors cursor-pointer"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            
            {selectedMealDate !== formatDateToYYYYMMDD(new Date()) && (
              <button
                onClick={handleSetToday}
                className="text-[10px] bg-[#00C853]/10 text-[#00C853] font-bold px-2.5 py-1 rounded-lg hover:bg-[#00C853]/20 transition-all cursor-pointer"
              >
                Back to Today
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8-Column Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* LARGE CIRCULAR PROGRESS RING & MACROS */}
              <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Ring Visualizer */}
                <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-44 h-44 drop-shadow-xs transform -rotate-90" viewBox="0 0 180 180">
                      <circle
                        cx="90"
                        cy="90"
                        r="72"
                        className="stroke-gray-100 fill-none"
                        strokeWidth="12"
                      />
                      <motion.circle
                        cx="90"
                        cy="90"
                        r="72"
                        className="fill-none transition-colors duration-300"
                        stroke={pct < 80 ? '#00C853' : pct <= 100 ? '#FF9100' : '#FF1744'}
                        strokeWidth="12"
                        strokeDasharray="452.39"
                        initial={{ strokeDashoffset: 452.39 }}
                        animate={{ strokeDashoffset: 452.39 - (Math.min(100, Math.max(0, pct)) / 100) * 452.39 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Centered statistics */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Consumed</span>
                      <span className="text-2xl font-black text-gray-800 leading-none mt-0.5">{consumedCals}</span>
                      <span className="text-[10px] text-gray-400 font-bold mt-1">/ {targetCalories} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Macro progress bars side by side */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Remaining Budget</span>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      {remainingCalories >= 0 ? (
                        <>
                          <span className="text-2xl font-black text-gray-800 font-mono">{remainingCalories}</span>
                          <span className="text-xs font-bold text-[#00C853] uppercase">kcal remaining</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-red-500 font-mono">{Math.abs(remainingCalories)}</span>
                          <span className="text-xs font-bold text-red-500 uppercase">kcal over budget</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Macro Targets</span>
                    
                    {/* Three macro bars side by side */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Protein - Blue */}
                      <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/50 flex flex-col">
                        <span className="text-[9px] uppercase font-black text-blue-500 tracking-wide">Protein</span>
                        <span className="text-xs font-black text-gray-700 mt-1 font-mono">{consumedProtein}g <span className="text-[8px] text-gray-400 font-normal block sm:inline">/ {targetMacros.p}g</span></span>
                        <div className="w-full bg-blue-100/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="bg-blue-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (consumedProtein / targetMacros.p) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Carbs - Orange */}
                      <div className="bg-orange-50/50 rounded-xl p-2.5 border border-orange-100/50 flex flex-col">
                        <span className="text-[9px] uppercase font-black text-orange-500 tracking-wide">Carbs</span>
                        <span className="text-xs font-black text-gray-700 mt-1 font-mono">{consumedCarbs}g <span className="text-[8px] text-gray-400 font-normal block sm:inline">/ {targetMacros.c}g</span></span>
                        <div className="w-full bg-orange-100/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="bg-orange-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (consumedCarbs / targetMacros.c) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Fats - Pink */}
                      <div className="bg-pink-50/50 rounded-xl p-2.5 border border-pink-100/50 flex flex-col">
                        <span className="text-[9px] uppercase font-black text-pink-500 tracking-wide">Fats</span>
                        <span className="text-xs font-black text-gray-700 mt-1 font-mono">{consumedFats}g <span className="text-[8px] text-gray-400 font-normal block sm:inline">/ {targetMacros.f}g</span></span>
                        <div className="w-full bg-pink-100/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <motion.div
                            className="bg-pink-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (consumedFats / targetMacros.f) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MEAL SECTIONS */}
              <div className="space-y-4">
                {[
                  { key: 'breakfast', label: 'Breakfast', emoji: '🌅', color: 'from-amber-400/10 to-orange-500/10 text-amber-600 border-amber-100/50' },
                  { key: 'morningSnack', label: 'Morning Snack', emoji: '🍎', color: 'from-emerald-400/10 to-teal-500/10 text-emerald-600 border-emerald-100/50' },
                  { key: 'lunch', label: 'Lunch', emoji: '☀️', color: 'from-blue-400/10 to-indigo-500/10 text-blue-600 border-blue-100/50' },
                  { key: 'eveningSnack', label: 'Evening Snack', emoji: '🍪', color: 'from-pink-400/10 to-rose-500/10 text-pink-600 border-pink-100/50' },
                  { key: 'dinner', label: 'Dinner', emoji: '🌙', color: 'from-purple-400/10 to-violet-500/10 text-purple-600 border-purple-100/50' }
                ].map((meal) => {
                  const key = meal.key as 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner';
                  const items = activeDateLog[key] || [];
                  const mealCals = getMealSlotCalories(key);
                  
                  return (
                    <div key={key} className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:border-gray-200 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${meal.color} border text-lg`}>
                            {meal.emoji}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-800">{meal.label}</h4>
                            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase">{mealCals} kcal logged</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedMealSlot(key);
                            setIsAddFoodModalOpen(true);
                            setFoodSearchQuery('');
                            setSelectedCategoryFilter('All');
                            setSelectedFoodForPortion(null);
                            setPortionMultiplier(1.0);
                            setCustomPortionInput('');
                            setIsCustomFoodFormActive(false);
                          }}
                          className="bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-white font-bold text-xs py-1.5 px-3.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus size={14} strokeWidth={3} />
                          Add Food
                        </button>
                      </div>

                      {/* Logged Foods List */}
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-150">
                            No foods logged yet. Tap + to add.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {items.map((item: any) => {
                              const computedCal = Math.round(item.calories * item.portionMultiplier);
                              return (
                                <div key={item.loggedId} className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-100 text-xs transition-colors">
                                  <div className="flex-1 min-w-0 pr-3">
                                    <div className="font-bold text-gray-800 truncate">{item.name}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                      {item.portionMultiplier}x portion ({item.servingSize * item.portionMultiplier}{item.servingUnit}) &bull; P: {Math.round(item.protein * item.portionMultiplier * 10) / 10}g &bull; C: {Math.round(item.carbs * item.portionMultiplier * 10) / 10}g &bull; F: {Math.round(item.fats * item.portionMultiplier * 10) / 10}g
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-gray-700 font-mono">{computedCal} kcal</span>
                                    <button
                                      onClick={() => deleteFoodFromMeal(key, item.loggedId)}
                                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4-Column Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* WATER TRACKER SUBSECTION */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                    <span className="text-blue-500">💧</span> Water Intake
                  </h3>
                  <span className="text-[11px] font-black text-blue-500 font-mono">
                    {activeDateLog.water || 0}ml / {targetWaterMl}ml
                  </span>
                </div>

                {/* Glass Row - 250ml each */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: Math.max(8, Math.ceil(targetWaterMl / 250)) }).map((_, index) => {
                    const currentWater = activeDateLog.water || 0;
                    const glassValue = (index + 1) * 250;
                    const isFilled = currentWater >= glassValue;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleWaterGlassClick(index)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isFilled ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-xs' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-gray-400 hover:bg-gray-100/50'}`}
                      >
                        <Droplet
                          size={18}
                          className={isFilled ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}
                        />
                        <span className="text-[8px] font-mono font-bold mt-1">250ml</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="pt-2 border-t border-gray-50 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 300ml"
                    value={customWaterInput}
                    onChange={(e) => setCustomWaterInput(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-blue-500"
                  />
                  <button
                    onClick={handleAddCustomWater}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    Add Custom
                  </button>
                </div>
              </div>

              {/* RECENT FOODS & FAVORITE FOODS */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 space-y-4">
                <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                  <Heart size={15} className="text-red-500 fill-red-500" /> Meal Organizers
                </h3>
                
                <div className="space-y-4">
                  {/* Favorites list */}
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2 font-mono">Favorite Foods ({favoriteFoods.length})</span>
                    {favoriteFoods.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic py-1">Tap the heart next to any ingredient to save as a favorite.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {FOOD_DATABASE.concat(customFoods).filter(f => favoriteFoods.includes(f.id)).map(food => (
                          <div
                            key={food.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-gray-800 truncate">{food.name}</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">{food.calories} kcal per {food.servingSize}{food.servingUnit}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleFavoriteFood(food.id)}
                                className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Heart size={13} className="fill-red-500" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedFoodForPortion(food);
                                  setSelectedMealSlot(selectedMealSlot || 'breakfast');
                                  setIsAddFoodModalOpen(true);
                                  setPortionMultiplier(1.0);
                                  setCustomPortionInput('');
                                }}
                                className="bg-emerald-50 text-emerald-600 hover:bg-[#00C853] hover:text-white p-1 rounded-lg transition-all cursor-pointer font-bold text-[9px] px-2 py-1"
                              >
                                Log
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent foods */}
                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2 font-mono">Recent Logs (Last 10)</span>
                    {recentFoods.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic py-1">Once logged, standard foods appear here for rapid logging.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {recentFoods.map((food, idx) => {
                          const isFav = favoriteFoods.includes(food.id);
                          return (
                            <div
                              key={`${food.id}-${idx}`}
                              className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="text-xs font-bold text-gray-800 truncate">{food.name}</p>
                                <p className="text-[9px] text-gray-400 font-mono mt-0.5">{food.calories} kcal &bull; {food.servingSize}{food.servingUnit}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleFavoriteFood(food.id)}
                                  className={`p-1 rounded-lg transition-colors cursor-pointer ${isFav ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-gray-100'}`}
                                >
                                  <Heart size={13} className={isFav ? 'fill-red-500' : ''} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedFoodForPortion(food);
                                    setSelectedMealSlot(selectedMealSlot || 'breakfast');
                                    setIsAddFoodModalOpen(true);
                                    setPortionMultiplier(1.0);
                                    setCustomPortionInput('');
                                  }}
                                  className="bg-emerald-50 text-emerald-600 hover:bg-[#00C853] hover:text-white p-1 rounded-lg transition-all cursor-pointer font-bold text-[9px] px-2 py-1"
                                >
                                  Log
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* WEEKLY BAR CHART VIEW */
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-800">Weekly Calorie Budget</h3>
              <p className="text-xs text-gray-500">Comparing dynamic intake against daily active target lines</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl">
              Past 7 Days
            </span>
          </div>

          {/* Bar Chart relative container */}
          <div className="relative pt-6 pb-2 px-4 h-[300px] border border-gray-100 bg-gray-50/30 rounded-2xl flex items-end justify-between gap-3 sm:gap-6 overflow-hidden">
            
            {/* Dashed target line overlay */}
            {chartMaxCal > 0 && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-500/60 z-10 flex items-center transition-all duration-500"
                style={{ bottom: `${(targetCalories / chartMaxCal) * 240 + 24}px` }}
              >
                <span className="bg-red-500 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded ml-2 shadow-xs">
                  Target: {targetCalories} kcal
                </span>
              </div>
            )}

            {weeklyChartData.map((day) => {
              const heightPercent = chartMaxCal > 0 ? (day.calories / chartMaxCal) * 100 : 0;
              const isToday = day.dateStr === formatDateToYYYYMMDD(new Date());
              const overTarget = day.calories > targetCalories;
              
              let barColor = 'bg-[#00C853] hover:bg-[#00E676]';
              if (overTarget) {
                barColor = 'bg-red-500 hover:bg-red-600';
              } else if (day.calories >= targetCalories * 0.8) {
                barColor = 'bg-[#FF9100] hover:bg-[#FFA726]';
              }

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative z-0">
                  
                  {/* Tooltip visible on hover */}
                  <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-[10px] py-1.5 px-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center shadow-md whitespace-nowrap z-20">
                    <span className="font-extrabold">{day.calories} kcal</span>
                    <br />
                    <span className="text-[8px] text-gray-400">{day.displayLabel}</span>
                  </div>

                  {/* Standard bar structure */}
                  <div className="w-full bg-gray-100 rounded-t-xl h-[240px] flex items-end overflow-hidden relative border border-gray-150">
                    <motion.div
                      className={`w-full rounded-t-lg ${barColor} transition-all duration-300`}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-[10px] font-black mt-2 tracking-wider ${isToday ? 'text-[#00C853]' : 'text-gray-500'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-[8px] text-gray-400 font-mono mt-0.5">
                    {isToday ? 'Today' : day.displayLabel.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-xs text-gray-500 flex items-start gap-2.5 leading-relaxed">
            <Info size={14} className="text-[#00C853] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-700">Understanding calorie density limits:</span> The horizontal red target line shows your calorie maintenance index (<strong className="text-gray-700">{targetCalories} kcal</strong>). Green bars denote healthy, macro-balanced daily targets, orange bars represent borderline thresholds, and red bars reflect surplus intake requiring active burn adjustments.
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD FOOD MODAL OVERLAY */}
      <AnimatePresence>
        {isAddFoodModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Modal header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-black text-base text-gray-800">
                    {selectedFoodForPortion ? 'Portion Selector' : `Add Food to ${selectedMealSlot ? selectedMealSlot.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}`}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {selectedFoodForPortion ? 'Adjust multiplier portion to log perfect nutrition' : 'Search standard databases or add custom foods'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddFoodModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer animate-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* A. CUSTOM FOOD CREATION PANEL */}
                {isCustomFoodFormActive ? (
                  <div className="space-y-4">
                    <div className="bg-[#00C853]/5 border border-[#00C853]/15 p-4 rounded-2xl">
                      <h4 className="text-xs font-black text-[#00C853] uppercase tracking-wide">Create Custom Ingredient</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Provide custom macros. This item saves instantly for future logs.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ingredient Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Traditional Paneer Paratha"
                          value={customFoodName}
                          onChange={(e) => setCustomFoodName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Calories * (kcal)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 290"
                          value={customFoodCalories}
                          onChange={(e) => setCustomFoodCalories(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Protein (g)</label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={customFoodProtein}
                          onChange={(e) => setCustomFoodProtein(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Carbohydrates (g)</label>
                        <input
                          type="number"
                          placeholder="e.g. 35"
                          value={customFoodCarbs}
                          onChange={(e) => setCustomFoodCarbs(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fats (g)</label>
                        <input
                          type="number"
                          placeholder="e.g. 12"
                          value={customFoodFats}
                          onChange={(e) => setCustomFoodFats(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Dietary Fiber (g)</label>
                        <input
                          type="number"
                          placeholder="e.g. 4"
                          value={customFoodFiber}
                          onChange={(e) => setCustomFoodFiber(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Serving Reference Size</label>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={customFoodServingSize}
                          onChange={(e) => setCustomFoodServingSize(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Serving Unit</label>
                        <input
                          type="text"
                          placeholder="e.g. g, ml, piece"
                          value={customFoodServingUnit}
                          onChange={(e) => setCustomFoodServingUnit(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-[#00C853]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => setIsCustomFoodFormActive(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (!customFoodName || !customFoodCalories) {
                            alert('Name and calories are strictly required.');
                            return;
                          }
                          const newFood: FoodItem = {
                            id: `custom_${Date.now()}`,
                            name: customFoodName,
                            category: 'Indian',
                            servingSize: Number(customFoodServingSize) || 100,
                            servingUnit: customFoodServingUnit || 'g',
                            calories: Number(customFoodCalories),
                            protein: Number(customFoodProtein) || 0,
                            carbs: Number(customFoodCarbs) || 0,
                            fats: Number(customFoodFats) || 0,
                            fiber: Number(customFoodFiber) || 0
                          };
                          
                          setCustomFoods(prev => [newFood, ...prev]);
                          setSelectedFoodForPortion(newFood);
                          setIsCustomFoodFormActive(false);
                          
                          // Reset
                          setCustomFoodName('');
                          setCustomFoodCalories('');
                          setCustomFoodProtein('');
                          setCustomFoodCarbs('');
                          setCustomFoodFats('');
                          setCustomFoodFiber('');
                          setCustomFoodServingSize('100');
                          setCustomFoodServingUnit('g');
                        }}
                        className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Save & Add
                      </button>
                    </div>
                  </div>
                ) : selectedFoodForPortion ? (
                  /* B. PORTION MULTIPLIER SELECTION PANEL */
                  <div className="space-y-5">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-gray-800">{selectedFoodForPortion.name}</h4>
                        <span className="text-[10px] bg-gray-200 text-gray-600 font-bold font-mono px-2 py-0.5 rounded uppercase">
                          {selectedFoodForPortion.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Base Serving reference: {selectedFoodForPortion.servingSize} {selectedFoodForPortion.servingUnit} &bull; {selectedFoodForPortion.calories} kcal
                      </p>
                    </div>

                    {/* Quick Multiplier selections */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Select Serving Multiplier</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { value: 0.5, label: '0.5x Portion' },
                          { value: 1.0, label: '1.0x (Standard)' },
                          { value: 1.5, label: '1.5x Large' },
                          { value: 2.0, label: '2.0x Double' },
                          { value: 'custom', label: 'Custom Value' }
                        ].map((chip) => {
                          const isSelected = chip.value === 'custom'
                            ? !([0.5, 1.0, 1.5, 2.0].includes(portionMultiplier))
                            : portionMultiplier === chip.value;
                          
                          return (
                            <button
                              key={chip.label}
                              onClick={() => {
                                if (chip.value === 'custom') {
                                  setPortionMultiplier(1.0);
                                  setCustomPortionInput('1.0');
                                } else {
                                  setPortionMultiplier(chip.value as number);
                                  setCustomPortionInput('');
                                }
                              }}
                              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${isSelected ? 'bg-[#00C853] text-white border-transparent shadow-xs' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                              {chip.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Manual text entry */}
                      {customPortionInput !== '' && (
                        <div className="pt-1.5 animate-in slide-in-from-top-1 duration-150">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Enter multiplier (e.g. 1.25, 0.75)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="e.g. 1.25"
                            value={customPortionInput}
                            onChange={(e) => {
                              setCustomPortionInput(e.target.value);
                              const num = parseFloat(e.target.value);
                              if (!isNaN(num) && num > 0) {
                                setPortionMultiplier(num);
                              }
                            }}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 w-full focus:outline-[#00C853]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Nutrient preview calculations */}
                    <div className="bg-[#00C853]/5 border border-[#00C853]/10 p-4 rounded-2xl space-y-2.5">
                      <span className="text-[10px] font-black text-[#00C853] uppercase tracking-wider block font-mono">Scaled Macro Allocation</span>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150">
                          <p className="text-[9px] uppercase text-gray-400 font-semibold">Calories</p>
                          <p className="font-bold text-gray-800 mt-0.5">{Math.round(selectedFoodForPortion.calories * portionMultiplier)} kcal</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150">
                          <p className="text-[9px] uppercase text-gray-400 font-semibold">Protein</p>
                          <p className="font-bold text-gray-800 mt-0.5">{Math.round(selectedFoodForPortion.protein * portionMultiplier * 10) / 10}g</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150">
                          <p className="text-[9px] uppercase text-gray-400 font-semibold">Carbs</p>
                          <p className="font-bold text-gray-800 mt-0.5">{Math.round(selectedFoodForPortion.carbs * portionMultiplier * 10) / 10}g</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150">
                          <p className="text-[9px] uppercase text-gray-400 font-semibold">Fats</p>
                          <p className="font-bold text-gray-800 mt-0.5">{Math.round(selectedFoodForPortion.fats * portionMultiplier * 10) / 10}g</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 text-center font-medium">
                        Total logged quantity: <span className="font-bold text-gray-700">{selectedFoodForPortion.servingSize * portionMultiplier}{selectedFoodForPortion.servingUnit}</span>
                      </div>
                    </div>

                    {/* Bottom confirmation */}
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedFoodForPortion(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (selectedMealSlot) {
                            logFoodToMeal(selectedFoodForPortion, selectedMealSlot, portionMultiplier);
                            setIsAddFoodModalOpen(false);
                          }
                        }}
                        className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Add to {selectedMealSlot ? selectedMealSlot.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : ''}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* C. SEARCH AND SELECTION PANEL */
                  <div className="space-y-4">
                    {/* Live search input */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search 80+ foods (e.g. Paneer Tikka, Oats, Apple, Water...)"
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-gray-800 focus:outline-[#00C853]"
                      />
                    </div>

                    {/* Filter Category chips */}
                    <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar shrink-0">
                      {['All', 'Indian', 'Proteins', 'Grains', 'Fruits', 'Vegetables', 'Beverages', 'Snacks'].map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategoryFilter(category)}
                          className={`py-1.5 px-3 rounded-full text-[10px] font-bold transition-all text-center whitespace-nowrap cursor-pointer ${selectedCategoryFilter === category ? 'bg-[#00C853] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Render matching foods */}
                    <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
                      {(() => {
                        const combined = FOOD_DATABASE.concat(customFoods);
                        const filtered = combined.filter((food) => {
                          const matchesCategory = selectedCategoryFilter === 'All' || food.category === selectedCategoryFilter;
                          const matchesQuery = food.name.toLowerCase().includes(foodSearchQuery.toLowerCase());
                          return matchesCategory && matchesQuery;
                        });

                        if (filtered.length === 0) {
                          return (
                            <p className="text-xs text-gray-400 italic py-8 text-center bg-gray-50 rounded-2xl">
                              No foods found matching your search filters.
                            </p>
                          );
                        }

                        return filtered.map((food) => {
                          const isFav = favoriteFoods.includes(food.id);
                          return (
                            <div
                              key={food.id}
                              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-100 transition-all text-xs group cursor-pointer"
                              onClick={() => setSelectedFoodForPortion(food)}
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="font-extrabold text-gray-800 text-sm group-hover:text-[#00C853] transition-colors">{food.name}</div>
                                <div className="text-[10px] text-gray-400 mt-1">
                                  {food.servingSize}{food.servingUnit} &bull; P: {food.protein}g &bull; C: {food.carbs}g &bull; F: {food.fats}g &bull; Fib: {food.fiber}g
                                </div>
                              </div>

                              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                <span className="font-mono font-bold text-gray-700 bg-gray-200/50 px-2.5 py-1 rounded-lg shrink-0">
                                  {food.calories} kcal
                                </span>
                                
                                <button
                                  onClick={() => toggleFavoriteFood(food.id)}
                                  className={`p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer ${isFav ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
                                >
                                  <Heart size={15} className={isFav ? 'fill-red-500' : ''} />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Bottom trigger for Custom form */}
                    <div className="pt-2 text-center border-t border-gray-100">
                      <button
                        onClick={() => setIsCustomFoodFormActive(true)}
                        className="text-xs font-bold text-[#00C853] hover:underline cursor-pointer"
                      >
                        Can't find your food? Create custom food
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
