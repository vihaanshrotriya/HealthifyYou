import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  FlameKindling, 
  Activity, 
  Flame as BurnIcon, 
  CupSoda, 
  Clock, 
  Scale, 
  ChevronRight, 
  Plus, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

interface DashboardTabProps {
  userProfile: any;
  setUserProfile: (profile: any) => void;
  caloriesConsumed: number;
  setCaloriesConsumed: any;
  hydrationConsumed: number;
  setHydrationConsumed: any;
  activeMinutes: number;
  setActiveMinutes: any;
  setActiveTab: (tab: 'dashboard' | 'workouts' | 'meals' | 'coach' | 'profile') => void;
}

interface WeightLogEntry {
  weight: number;
  date: string;
  note?: string;
}

export default function DashboardTab({
  userProfile,
  setUserProfile,
  caloriesConsumed,
  setCaloriesConsumed,
  hydrationConsumed,
  setHydrationConsumed,
  activeMinutes,
  setActiveMinutes,
  setActiveTab
}: DashboardTabProps) {
  // 1. Core State
  const [weightLog, setWeightLog] = useState<WeightLogEntry[]>([]);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [weightNote, setWeightNote] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // 2. Load and seed weightLog
  useEffect(() => {
    const stored = localStorage.getItem('weightLog');
    if (stored) {
      try {
        setWeightLog(JSON.parse(stored));
      } catch (e) {
        seedWeightLog();
      }
    } else {
      seedWeightLog();
    }
  }, []);

  const seedWeightLog = () => {
    const baseWeight = userProfile.weight || 71;
    const today = new Date();
    const seeded: WeightLogEntry[] = [];
    
    // Seed 3 values over the past 15 days to give a nice initial graph
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i * 6);
      const dateStr = d.toISOString().split('T')[0];
      const weightDiff = i === 2 ? 1.8 : i === 1 ? 0.9 : 0;
      seeded.push({
        weight: parseFloat((baseWeight + weightDiff).toFixed(1)),
        date: dateStr,
        note: i === 2 ? 'Starting point' : i === 1 ? 'Feeling lighter' : 'Check-in'
      });
    }
    setWeightLog(seeded);
    localStorage.setItem('weightLog', JSON.stringify(seeded));
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Helper date formatting
  const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Today's formatted date
  const formattedToday = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Streak calculation: Consecutive days with at least 1 logged meal OR workout
  const streak = useMemo(() => {
    try {
      const mealHistoryRaw = localStorage.getItem('mealHistory');
      const mealHistory = mealHistoryRaw ? JSON.parse(mealHistoryRaw) : {};
      
      const workoutHistoryRaw = localStorage.getItem('workoutHistory');
      const workoutHistory = workoutHistoryRaw ? JSON.parse(workoutHistoryRaw) : [];

      const activeDates = new Set<string>();

      // Parse mealHistory dates
      Object.keys(mealHistory).forEach(date => {
        const log = mealHistory[date];
        if (!log) return;
        const hasMeals = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'].some(
          key => log[key] && log[key].length > 0
        );
        const hasWater = log.water && log.water > 0;
        if (hasMeals || hasWater) {
          activeDates.add(date);
        }
      });

      // Parse workoutHistory dates
      workoutHistory.forEach((w: any) => {
        if (w.date) {
          // Check if YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(w.date)) {
            activeDates.add(w.date);
          } else {
            // Parse to YYYY-MM-DD
            try {
              const d = new Date(w.date);
              if (!isNaN(d.getTime())) {
                activeDates.add(d.toISOString().split('T')[0]);
              }
            } catch (e) {}
          }
        }
      });

      let calculatedStreak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
          calculatedStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // If we logged yesterday but not today yet, keep going
          if (calculatedStreak === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (activeDates.has(yesterdayStr)) {
              checkDate = yesterday;
              continue;
            }
          }
          break;
        }
      }

      return Math.max(calculatedStreak, userProfile.streak || 1);
    } catch (e) {
      return userProfile.streak || 1;
    }
  }, [userProfile.streak]);

  // Calories, minutes, sleep data
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / (userProfile.targetCalories || 2000)) * 100));
  const activePercent = Math.min(100, Math.round((activeMinutes / 30) * 100)); // Default 30 min target
  const waterTargetLiters = userProfile.waterGoal || 2.5;
  const waterGlasses = Math.round(hydrationConsumed * 1000 / 250);
  const waterTargetGlasses = Math.round(waterTargetLiters * 1000 / 250);
  const waterPercent = Math.min(100, Math.round((waterGlasses / waterTargetGlasses) * 100));

  // BMI calculations
  const bmiValue = useMemo(() => {
    const heightInMeters = userProfile.height / 100;
    if (!heightInMeters) return 22.0;
    return parseFloat((userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [userProfile.height, userProfile.weight]);

  const bmiStatus = useMemo(() => {
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20', rawColor: '#3b82f6' };
    if (bmiValue < 25.0) return { text: 'Normal', color: 'text-green-500 bg-green-50 dark:bg-green-950/20', rawColor: '#10b981' };
    if (bmiValue < 30.0) return { text: 'Overweight', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20', rawColor: '#f97316' };
    return { text: 'Obese', color: 'text-red-500 bg-red-50 dark:bg-red-950/20', rawColor: '#ef4444' };
  }, [bmiValue]);

  // Save Weight Entry
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(newWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    const entry: WeightLogEntry = {
      weight: parsedWeight,
      date: weightDate,
      note: weightNote.trim() || undefined
    };

    const updatedLog = [...weightLog, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeightLog(updatedLog);
    localStorage.setItem('weightLog', JSON.stringify(updatedLog));

    // Update profile weight as well
    const updatedProfile = { ...userProfile, weight: parsedWeight };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    setIsWeightModalOpen(false);
    setNewWeight('');
    setWeightNote('');
    showToast(`Weight of ${parsedWeight} kg logged successfully!`);
  };

  // SVG Line Chart coordinates mapping
  const chartData = useMemo(() => {
    if (weightLog.length === 0) return { points: [], minW: 0, maxW: 0, targetLineY: 0 };
    
    // Sort log and filter past 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const filtered = weightLog.filter(entry => new Date(entry.date) >= cutoff);
    
    if (filtered.length === 0) return { points: [], minW: 0, maxW: 0, targetLineY: 0 };

    const weights = filtered.map(d => d.weight);
    const targetW = userProfile.targetWeight || 65;
    const allWeightsWithTarget = [...weights, targetW];
    
    const maxW = Math.max(...allWeightsWithTarget) + 1.5;
    const minW = Math.max(0, Math.min(...allWeightsWithTarget) - 1.5);
    const wRange = maxW - minW || 1;

    const width = 500;
    const height = 180;
    const padX = 40;
    const padY = 25;

    const points = filtered.map((d, idx) => {
      const x = padX + (idx / Math.max(1, filtered.length - 1)) * (width - padX * 2);
      const y = height - padY - ((d.weight - minW) / wRange) * (height - padY * 2);
      return { x, y, weight: d.weight, date: d.date, note: d.note };
    });

    const targetLineY = height - padY - ((targetW - minW) / wRange) * (height - padY * 2);

    return { points, minW, maxW, targetLineY, targetW, filtered };
  }, [weightLog, userProfile.targetWeight]);

  // Weight statistics summary
  const weightSummary = useMemo(() => {
    if (weightLog.length === 0) return { started: 0, current: 0, change: 0 };
    const started = weightLog[0].weight;
    const current = weightLog[weightLog.length - 1].weight;
    const change = parseFloat((current - started).toFixed(1));
    return { started, current, change };
  }, [weightLog]);

  // One tap Log Water (Quick Action)
  const handleLogWaterQuick = () => {
    try {
      const todayKey = getTodayKey();
      const mealHistoryRaw = localStorage.getItem('mealHistory');
      const mealHistory = mealHistoryRaw ? JSON.parse(mealHistoryRaw) : {};
      const todayLog = mealHistory[todayKey] || {
        breakfast: [],
        morningSnack: [],
        lunch: [],
        eveningSnack: [],
        dinner: [],
        water: 0
      };

      // Add 1 glass (250ml)
      const updatedWater = (todayLog.water || 0) + 250;
      const updatedTodayLog = { ...todayLog, water: updatedWater };
      const updatedHistory = { ...mealHistory, [todayKey]: updatedTodayLog };
      
      localStorage.setItem('mealHistory', JSON.stringify(updatedHistory));
      setHydrationConsumed(updatedWater / 1000);
      showToast(`Logged +250ml water! Today's total: ${updatedWater}ml`);
    } catch (e) {
      console.error(e);
    }
  };

  // Rule-based Weekly Insights
  const insights = useMemo(() => {
    const list = [];
    
    // Workout streaks
    try {
      const workoutHistoryRaw = localStorage.getItem('workoutHistory');
      const workoutHistory = workoutHistoryRaw ? JSON.parse(workoutHistoryRaw) : [];
      if (workoutHistory.length > 0) {
        list.push({
          type: 'workout',
          icon: '🏃‍♂️',
          title: 'Amazing workout consistency!',
          desc: `You have successfully completed ${workoutHistory.length} training sessions. Keep pushing your fitness boundaries!`
        });
      }
    } catch (e) {}

    // Weight loss progress
    if (weightSummary.change < 0) {
      list.push({
        type: 'weight',
        icon: '📉',
        title: 'Outstanding weight progress!',
        desc: `You have shed ${Math.abs(weightSummary.change)} kg since your first log. Your trajectory matches your goal.`
      });
    }

    // Protein tracking check
    try {
      const mealHistoryRaw = localStorage.getItem('mealHistory');
      const mealHistory = mealHistoryRaw ? JSON.parse(mealHistoryRaw) : {};
      
      let lowProteinDays = 0;
      const last7DaysKeys = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysKeys.push(d.toISOString().split('T')[0]);
      }

      last7DaysKeys.forEach(key => {
        const dayMeals = mealHistory[key];
        if (dayMeals) {
          let dayProtein = 0;
          ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'].forEach(k => {
            const items = dayMeals[k] || [];
            items.forEach((item: any) => {
              // Assume standard protein estimate if missing, otherwise use item macros
              dayProtein += item.protein ? Math.round(item.protein * item.portionMultiplier) : 10;
            });
          });
          const targetProtein = userProfile.macros?.p || 150;
          if (dayProtein < targetProtein * 0.7) {
            lowProteinDays++;
          }
        }
      });

      if (lowProteinDays > 0) {
        list.push({
          type: 'diet',
          icon: '🥚',
          title: 'Protein optimization opportunity',
          desc: `Protein intake was under threshold on ${lowProteinDays} of the past 7 days. Add eggs or organic chicken breast to hit targets.`
        });
      }
    } catch (e) {}

    // Fallback default insights
    if (list.length === 0) {
      list.push({
        type: 'start',
        icon: '✨',
        title: 'Start Logging Daily Metrics',
        desc: 'Log meals, hydration and workouts to unlock rule-based insights and professional biometrics coaching.'
      });
    }

    return list;
  }, [weightSummary, userProfile.macros]);

  return (
    <div id="app-dashboard" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header with dynamic greeting and streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1A1C29] p-6 rounded-3xl border border-gray-150/80 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
            {greeting}, {userProfile.name}!
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {formattedToday}
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/15 max-w-max">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <div>
            <p className="text-xs font-black tracking-tight leading-none text-amber-700 dark:text-amber-400">{streak} Day Streak!</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Meal or training logged</p>
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div 
          onClick={() => setActiveTab('meals')}
          className="bg-white dark:bg-[#1A1C29] p-5 rounded-2xl border border-gray-150/80 shadow-sm cursor-pointer hover:border-[#00C853] transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 bg-[#00C853]/10 text-[#00C853] rounded-xl"><BurnIcon size={18} /></span>
            {/* SVG Ring */}
            <svg className="w-9 h-9 transform -rotate-90">
              <circle cx="18" cy="18" r="14" stroke="#f3f4f6" strokeWidth="3" fill="transparent" />
              <circle 
                cx="18" cy="18" r="14" stroke="#00C853" strokeWidth="3" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - caloriePercent / 100)}`}
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Calories</p>
            <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{caloriesConsumed} kcal</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Budget: {userProfile.targetCalories || 2000} kcal</p>
          </div>
        </div>

        {/* Workout Card */}
        <div 
          onClick={() => setActiveTab('workouts')}
          className="bg-white dark:bg-[#1A1C29] p-5 rounded-2xl border border-gray-150/80 shadow-sm cursor-pointer hover:border-[#00C853] transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Activity size={18} /></span>
            <svg className="w-9 h-9 transform -rotate-90">
              <circle cx="18" cy="18" r="14" stroke="#f3f4f6" strokeWidth="3" fill="transparent" />
              <circle 
                cx="18" cy="18" r="14" stroke="#3b82f6" strokeWidth="3" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - activePercent / 100)}`}
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Workouts</p>
            <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{activeMinutes} mins</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Daily Goal: 30 mins</p>
          </div>
        </div>

        {/* Water Card */}
        <div 
          onClick={() => setActiveTab('meals')}
          className="bg-white dark:bg-[#1A1C29] p-5 rounded-2xl border border-gray-150/80 shadow-sm cursor-pointer hover:border-[#00C853] transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><CupSoda size={18} /></span>
            <svg className="w-9 h-9 transform -rotate-90">
              <circle cx="18" cy="18" r="14" stroke="#f3f4f6" strokeWidth="3" fill="transparent" />
              <circle 
                cx="18" cy="18" r="14" stroke="#10b981" strokeWidth="3" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - waterPercent / 100)}`}
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Water</p>
            <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{waterGlasses} / {waterTargetGlasses} glasses</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Total: {hydrationConsumed.toFixed(1)}L</p>
          </div>
        </div>

        {/* Sleep Card */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="bg-white dark:bg-[#1A1C29] p-5 rounded-2xl border border-gray-150/80 shadow-sm cursor-pointer hover:border-[#00C853] transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><Clock size={18} /></span>
            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">Optimal</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Sleep Schedule</p>
            <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">8.0 hrs Target</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">11:00 PM - 07:00 AM</p>
          </div>
        </div>

      </div>

      {/* 3. Weight progress line chart & BMI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weight Progress chart card */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1A1C29] p-6 rounded-3xl border border-gray-150/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-800 dark:text-white text-base">Weight Progress Log</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Real-time biometrics tracking over the last 30 days</p>
            </div>
            
            <button 
              onClick={() => setIsWeightModalOpen(true)}
              className="bg-[#00C853] hover:bg-[#00E676] text-white text-[11px] font-black px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Scale size={13} /> Log Weight
            </button>
          </div>

          {/* SVG Weight Line Chart */}
          <div className="relative h-44 w-full">
            {chartData.points.length < 2 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                Not enough biometric points to display line chart. Log your weight.
              </div>
            ) : (
              <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                {/* Definitions for beautiful linear gradients */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C853" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Target dashed line */}
                {chartData.targetLineY >= 0 && (
                  <g>
                    <line 
                      x1="40" y1={chartData.targetLineY} x2="460" y2={chartData.targetLineY} 
                      stroke="#00C853" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6"
                    />
                    <text x="45" y={chartData.targetLineY - 6} fill="#00C853" fontSize="8" fontWeight="bold">
                      Goal: {chartData.targetW} kg
                    </text>
                  </g>
                )}

                {/* Shaded Area under the curve */}
                {chartData.points.length > 0 && (
                  <path 
                    d={`M ${chartData.points[0].x} 155 
                        L ${chartData.points.map(p => `${p.x} ${p.y}`).join(' L ')} 
                        L ${chartData.points[chartData.points.length - 1].x} 155 Z`}
                    fill="url(#chartGradient)"
                  />
                )}

                {/* Main line plot */}
                {chartData.points.length > 0 && (
                  <path 
                    d={`M ${chartData.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                )}

                {/* Grid guidelines & Y-axis scale */}
                <line x1="40" y1="155" x2="460" y2="155" stroke="#e5e7eb" strokeWidth="1" />
                <text x="465" y="158" fill="#9ca3af" fontSize="8" textAnchor="start">
                  {chartData.minW.toFixed(1)}
                </text>
                <text x="465" y="30" fill="#9ca3af" fontSize="8" textAnchor="start">
                  {chartData.maxW.toFixed(1)}
                </text>

                {/* Dots on points */}
                {chartData.points.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle 
                      cx={p.x} cy={p.y} r="4" fill="#00C853" stroke="#fff" strokeWidth="1.5" 
                      className="transition-all duration-200 group-hover/dot:r-6"
                    />
                    <circle 
                      cx={p.x} cy={p.y} r="12" fill="transparent" 
                    />
                    {/* Tooltip on hover */}
                    <title>{`${p.weight} kg on ${p.date}${p.note ? ` (${p.note})` : ''}`}</title>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* Started, Current, and Change readout */}
          <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4 text-xs font-semibold">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Started</p>
              <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">{weightSummary.started} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current</p>
              <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">{weightSummary.current} kg</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Net Change</p>
              <div className="flex items-center gap-1 mt-0.5">
                {weightSummary.change < 0 ? (
                  <span className="flex items-center text-green-500 font-bold text-sm">
                    <TrendingDown size={14} /> {Math.abs(weightSummary.change)} kg
                  </span>
                ) : weightSummary.change > 0 ? (
                  <span className="flex items-center text-red-500 font-bold text-sm">
                    <TrendingUp size={14} /> +{weightSummary.change} kg
                  </span>
                ) : (
                  <span className="text-gray-500 font-bold">Stable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BMI Gauge card */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1A1C29] p-6 rounded-3xl border border-gray-150/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-gray-800 dark:text-white text-base">BMI Scale & Biometrics</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Calculated from verified height & weight metrics</p>
          </div>

          <div className="text-center py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Your Current BMI</p>
            <p className="text-4xl font-black text-[#00C853] mt-1">{bmiValue}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider mt-2.5 ${bmiStatus.color}`}>
              {bmiStatus.text}
            </span>
          </div>

          {/* BMI Horizontal gauge zones */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-gray-400">
              <span>15.0</span>
              <span>18.5</span>
              <span>25.0</span>
              <span>30.0</span>
              <span>35.0</span>
            </div>
            
            <div className="relative h-2.5 w-full rounded-full flex overflow-hidden bg-gray-100">
              <div className="w-[17.5%] bg-blue-500" title="Underweight"></div>
              <div className="w-[32.5%] bg-green-500" title="Normal Weight"></div>
              <div className="w-[25%] bg-orange-500" title="Overweight"></div>
              <div className="w-[25%] bg-red-500" title="Obese"></div>

              {/* Pin pointer marker */}
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-black dark:bg-white border border-white dark:border-black rounded-full shadow-md"
                style={{ left: `${Math.max(0, Math.min(100, ((bmiValue - 15) / 20) * 100))}%`, transform: 'translateX(-50%)' }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4. Weekly Insights */}
      <div className="bg-white dark:bg-[#1A1C29] p-6 rounded-3xl border border-gray-150/80 shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-gray-800 dark:text-white text-base">Continuous Weekly Insights</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Biometric audits & pattern-analyzed optimization directives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex items-start gap-3.5"
            >
              <span className="text-2xl mt-0.5 shrink-0">{insight.icon}</span>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">{insight.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{insight.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Quick Action Bar */}
      <div className="bg-white dark:bg-[#1A1C29] p-4.5 rounded-3xl border border-gray-150/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#00C853]" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Quick Logging Utilities</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setActiveTab('meals')}
            className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 text-xs font-bold rounded-xl border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
          >
            <Plus size={14} className="text-[#00C853]" /> Log Meal
          </button>
          
          <button 
            onClick={() => setActiveTab('workouts')}
            className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 text-xs font-bold rounded-xl border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
          >
            <Plus size={14} className="text-[#00C853]" /> Start Workout
          </button>

          <button 
            onClick={() => setIsWeightModalOpen(true)}
            className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 text-xs font-bold rounded-xl border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
          >
            <Plus size={14} className="text-[#00C853]" /> Log Weight
          </button>

          <button 
            onClick={handleLogWaterQuick}
            className="flex items-center gap-1 px-4 py-2.5 bg-[#00C853]/10 hover:bg-[#00C853]/15 text-xs font-bold rounded-xl border border-[#00C853]/15 text-[#009624] dark:text-[#00C853] cursor-pointer transition-colors"
          >
            <Plus size={14} /> Log Water (+1 Glass)
          </button>
        </div>
      </div>

      {/* 6. TOAST NOTIFICATION */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-xs font-bold px-4.5 py-3 rounded-xl shadow-2xl border border-white/10 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-2">
          <CheckCircle size={14} className="text-[#00C853]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 7. LOG WEIGHT MODAL */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[90] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1C29] border border-gray-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-extrabold text-gray-800 dark:text-white text-base">Record Biometric Weight</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Logs metric bodyweight and updates metabolic calculators</p>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Body Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  placeholder="e.g. 70.5"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-[#00C853]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Log Date</label>
                <input 
                  type="date" 
                  required
                  value={weightDate}
                  onChange={e => setWeightDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-[#00C853]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Biometric Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Morning fasting check-in"
                  value={weightNote}
                  onChange={e => setWeightNote(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-[#00C853]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-200 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
