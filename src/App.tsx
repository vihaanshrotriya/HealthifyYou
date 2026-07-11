/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FOOD_DATABASE, FoodItem } from './data/foodDatabase';
import MealsTab from './components/MealsTab';
import CoachTab from './components/CoachTab';
import DashboardTab from './components/DashboardTab';
import {
  Activity,
  Flame,
  Droplet,
  Clock,
  Sparkles,
  TrendingUp,
  User,
  ChefHat,
  Dumbbell,
  ChevronRight,
  Check,
  Plus,
  Menu,
  X,
  Lock,
  Shield,
  Coins,
  MessageSquare,
  LogOut,
  Heart,
  Award,
  Search,
  Camera,
  Scale,
  FileText,
  CheckCircle,
  Brain,
  Info,
  Calendar,
  Zap,
  ArrowRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';

// Configuration Config arrays to keep token counts compact
const FEATURES = [
  { id: 'workout', title: 'AI Workout Planner', desc: 'Daily routines tailored to your metabolism and goals.', isLime: false, icon: Dumbbell },
  { id: 'calorie', title: 'Calorie Tracker', desc: 'Log meals instantly with AI nutritional estimation.', isLime: true, icon: ChefHat },
  { id: 'dashboard', title: 'Smart Dashboard', desc: 'All your vitals in one beautiful command center.', isLime: false, icon: Activity },
  { id: 'fitbit', title: 'AI Coach FitBit', desc: 'Wearable integration for continuous feedback loops.', isLime: true, icon: Sparkles },
  { id: 'analytics', title: 'Progress Analytics', desc: 'Deep dive into your weekly and monthly metrics.', isLime: false, icon: TrendingUp },
  { id: 'reports', title: 'Email Reports', desc: 'Detailed summaries delivered to your inbox weekly.', isLime: true, icon: FileText }
];

const STEPS = [
  { num: '01', title: 'Analyze Bio-data', desc: 'Input your baseline goals, age, height, weight and metrics.' },
  { num: '02', title: 'AI Plan Generation', desc: 'Get bespoke dynamic meal and workout schedules tailored daily.' },
  { num: '03', title: 'Sync Fitbit Loops', desc: 'Wearable streams feed our engine for continuous recalibrations.' },
  { num: '04', title: 'Adaptive Progress', desc: 'Watch your performance indicators climb as plans auto-optimize.' }
];

const PRICING = [
  { name: 'Free Starter', price: '$0', desc: 'Essential health logging utilities.', features: ['Manual Calorie & Meal Logger', 'Standard Exercise Library', 'Local Dashboard Vitals', 'Community Forum Access'], popular: false },
  { name: 'Pro Athlete', price: '$19', desc: 'Our most popular AI companion plan.', features: ['AI Daily Workout Generator', 'AI Nutrition Scan Scanner', 'Fitbit Live Stream Sync', 'Weekly Digest Email Reports', 'Custom Core Exercises'], popular: true },
  { name: 'Premium Elite', price: '$39', desc: 'Unlimited bio-analytical coaching.', features: ['24/7 Immersive AI Coach Chat', 'Advanced Metabolic Profiles', 'Biometric Analytics Suite', 'Personalized Macro Feedback', 'Priority AI Model Access'], popular: false }
];

const TESTIMONIALS = [
  { quote: "Amazing progress in 3 weeks! The AI coach recommendations match my Fitbit data perfectly.", author: "Sarah M.", tag: "Pro Member", loss: "Lost 12 lbs" },
  { quote: "The dynamic workout schedule adapts to my busy executive calendar. Highly recommended!", author: "David K.", tag: "Pro Member", loss: "Metabolism boosted" },
  { quote: "The meal scanner accurately guessed my avocado toast macros. So fast and helpful!", author: "Elena R.", tag: "Premium Member", loss: "Athletic Peak" }
];

const MUSCLE_GROUPS = ['All', 'Chest', 'Legs', 'Core', 'Back'];
const WORKOUT_CATEGORIES = ['All', 'Strength', 'Cardio', 'Yoga', 'HIIT'];

const EXERCISES_LIBRARY = [
  // Strength
  {
    id: 'push_ups',
    name: 'Push-ups',
    category: 'Strength',
    difficulty: 'Beginner',
    durationOrReps: '3 sets x 12 reps',
    caloriesPerMinute: 8,
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
    instructions: [
      'Place hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest to the floor.',
      'Push back up to the starting position.'
    ],
    formTips: [
      'Do not let your lower back sag.',
      'Engage your core throughout the movement.'
    ],
    muscle: 'Chest',
    level: 'Beginner',
    desc: 'Place hands slightly wider than shoulder-width, lower chest to the floor keeping body straight, and push back up.'
  },
  {
    id: 'squats',
    name: 'Bodyweight Squats',
    category: 'Strength',
    difficulty: 'Beginner',
    durationOrReps: '3 sets x 15 reps',
    caloriesPerMinute: 7,
    targetMuscles: ['Legs', 'Glutes', 'Hamstrings'],
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Lower hips as if sitting in a chair.',
      'Keep chest upright and knees behind toes.',
      'Drive through heels to stand.'
    ],
    formTips: [
      'Keep your weight on your heels.',
      'Do not let knees collapse inward.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'Stand with feet shoulder-width apart, lower hips back and down, then return to upright standing position.'
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    category: 'Strength',
    difficulty: 'Beginner',
    durationOrReps: '3 sets x 10 reps',
    caloriesPerMinute: 6,
    targetMuscles: ['Legs', 'Glutes', 'Hamstrings'],
    instructions: [
      'Step forward with one foot.',
      'Lower hips until both knees are bent at 90 degrees.',
      'Push off front foot to step forward.',
      'Repeat on the other side.'
    ],
    formTips: [
      'Keep torso upright.',
      'Do not let front knee pass your toes.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'Step forward and lower hips until knees are bent, then push through heels to return to standing.'
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    category: 'Strength',
    difficulty: 'Advanced',
    durationOrReps: '3 sets x 6 reps',
    caloriesPerMinute: 9,
    targetMuscles: ['Back', 'Biceps', 'Shoulders'],
    instructions: [
      'Hang from a bar with palms facing away.',
      'Pull your chest up to the bar.',
      'Squeeze shoulder blades at the top.',
      'Slowly lower back down.'
    ],
    formTips: [
      'Avoid using momentum or swinging.',
      'Keep shoulders down and back.'
    ],
    muscle: 'Back',
    level: 'Advanced',
    desc: 'Hang from an overhead bar and pull your body up until your chin clears the bar, then slowly lower.'
  },
  {
    id: 'glute_bridges',
    name: 'Glute Bridges',
    category: 'Strength',
    difficulty: 'Beginner',
    durationOrReps: '3 sets x 15 reps',
    caloriesPerMinute: 5,
    targetMuscles: ['Core', 'Glutes', 'Hamstrings'],
    instructions: [
      'Lie on your back with knees bent and feet flat.',
      'Squeeze glutes and lift hips toward the ceiling.',
      'Hold at the top for 2 seconds.',
      'Lower hips back to the floor.'
    ],
    formTips: [
      'Drive through your heels.',
      'Do not hyperextend your lower back at the top.'
    ],
    muscle: 'Core',
    level: 'Beginner',
    desc: 'Lie on your back, bend knees, lift hips toward ceiling while squeezing glutes, then lower slowly.'
  },
  {
    id: 'diamond_pushups',
    name: 'Diamond Push-ups',
    category: 'Strength',
    difficulty: 'Advanced',
    durationOrReps: '3 sets x 10 reps',
    caloriesPerMinute: 9,
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
    instructions: [
      'Place hands close together under chest forming a diamond shape.',
      'Lower chest to hands.',
      'Push back up keeping elbows close to body.',
      'Maintain a rigid straight body alignment.'
    ],
    formTips: [
      'Squeeze your triceps at the top.',
      'Keep your core braced tightly.'
    ],
    muscle: 'Chest',
    level: 'Advanced',
    desc: 'Perform pushups with hands touching to form a diamond shape, maximizing triceps involvement.'
  },
  {
    id: 'overhead_press',
    name: 'Dumbbell Shoulder Press',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationOrReps: '3 sets x 12 reps',
    caloriesPerMinute: 6,
    targetMuscles: ['Shoulders', 'Triceps'],
    instructions: [
      'Sit or stand holding dumbbells at shoulder level.',
      'Press weights straight overhead.',
      'Lower back to starting position with control.',
      'Keep your core engaged.'
    ],
    formTips: [
      'Avoid arching your lower back.',
      'Keep wrists aligned over elbows.'
    ],
    muscle: 'Shoulders',
    level: 'Intermediate',
    desc: 'Hold weights at shoulder height and press them straight overhead, then return to start.'
  },
  {
    id: 'romanian_deadlift',
    name: 'Dumbbell Romanian Deadlift',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationOrReps: '3 sets x 12 reps',
    caloriesPerMinute: 7,
    targetMuscles: ['Legs', 'Hamstrings', 'Glutes', 'Back'],
    instructions: [
      'Stand with dumbbells, hinge forward at hips.',
      'Keep back flat and slide weights down legs.',
      'Squeeze glutes to stand back up.',
      'Maintain a soft bend in knees.'
    ],
    formTips: [
      'Keep back straight, do not round.',
      'Keep weights close to your legs.'
    ],
    muscle: 'Legs',
    level: 'Intermediate',
    desc: 'Stand holding dumbbells, hinge forward at hips keeping back flat to stretch hamstrings, then return.'
  },

  // HIIT
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'HIIT',
    difficulty: 'Advanced',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 12,
    targetMuscles: ['Full Body', 'Cardio', 'Legs', 'Chest'],
    instructions: [
      'Start standing, drop into a squat.',
      'Kick feet back into a plank position.',
      'Perform a push-up.',
      'Jump feet back in and leap into the air.'
    ],
    formTips: [
      'Land softly on your feet.',
      'Keep a steady explosive rhythm.'
    ],
    muscle: 'Full Body',
    level: 'Advanced',
    desc: 'An explosive full-body movement combining squatting, jumping, and plank push-ups for dynamic cardiovascular loading.'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 10,
    targetMuscles: ['Core', 'Shoulders', 'Cardio'],
    instructions: [
      'Start in a high plank position.',
      'Drive one knee up toward your chest.',
      'Quickly switch legs in a running motion.',
      'Keep hips level and hands directly under shoulders.'
    ],
    formTips: [
      'Do not bounce your hips.',
      'Engage your abs throughout.'
    ],
    muscle: 'Core',
    level: 'Intermediate',
    desc: 'High-speed high-intensity knee drives from a plank position, building strong abs and conditioning.'
  },
  {
    id: 'kettlebell_swings',
    name: 'Kettlebell Swings',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 11,
    targetMuscles: ['Legs', 'Glutes', 'Hamstrings', 'Core'],
    instructions: [
      'Stand over kettlebell, hinge hips back.',
      'Swing kettlebell between legs.',
      'Snap hips forward to swing bell to shoulder height.',
      'Control the descent.'
    ],
    formTips: [
      'Drive the movement with your hips, not arms.',
      'Keep back flat at all times.'
    ],
    muscle: 'Legs',
    level: 'Intermediate',
    desc: 'An explosive hip-hinge swing that drives power through glutes, hamstrings, and the posterior chain.'
  },
  {
    id: 'high_knees',
    name: 'High Knees',
    category: 'HIIT',
    difficulty: 'Beginner',
    durationOrReps: '30 seconds',
    caloriesPerMinute: 9,
    targetMuscles: ['Cardio', 'Legs', 'Core'],
    instructions: [
      'Stand tall, run in place.',
      'Lift knees as high as possible to hip level.',
      'Pump arms dynamically.',
      'Stay on the balls of your feet.'
    ],
    formTips: [
      'Keep your spine upright.',
      'Land lightly on your feet.'
    ],
    muscle: 'Cardio',
    level: 'Beginner',
    desc: 'Rapidly lift knees high to hip level while running in place to pump up active heart rates.'
  },
  {
    id: 'jump_squats',
    name: 'Jump Squats',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationOrReps: '40 seconds',
    caloriesPerMinute: 11,
    targetMuscles: ['Legs', 'Glutes', 'Cardio'],
    instructions: [
      'Lower into a standard squat.',
      'Explode upward leaping off the ground.',
      'Land softly and immediately absorb weight into next squat.',
      'Keep chest up.'
    ],
    formTips: [
      'Make sure to land softly on mid-foot.',
      'Keep knees from caving.'
    ],
    muscle: 'Legs',
    level: 'Intermediate',
    desc: 'Perform a standard deep squat and explode upwards with a jump, landing softly into the next squat.'
  },
  {
    id: 'plank_jacks',
    name: 'Plank Jacks',
    category: 'HIIT',
    difficulty: 'Intermediate',
    durationOrReps: '40 seconds',
    caloriesPerMinute: 8,
    targetMuscles: ['Core', 'Shoulders', 'Legs'],
    instructions: [
      'Start in low plank on forearms.',
      'Jump feet out wide, then jump them back together.',
      'Keep core locked and hips stable.',
      'Maintain a straight body line.'
    ],
    formTips: [
      'Do not let your lower back sag.',
      'Breathe steadily.'
    ],
    muscle: 'Core',
    level: 'Intermediate',
    desc: 'Maintain forearm plank while jumping feet out and in, testing metabolic stamina and core core-strength.'
  },
  {
    id: 'thrusters',
    name: 'Dumbbell Thrusters',
    category: 'HIIT',
    difficulty: 'Advanced',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 13,
    targetMuscles: ['Full Body', 'Legs', 'Shoulders'],
    instructions: [
      'Hold dumbbells at shoulders, squat down.',
      'As you stand, press dumbbells overhead in one fluid motion.',
      'Lower weights back to shoulders and squat again.',
      'Ensure deep squat depth.'
    ],
    formTips: [
      'Use leg power to press weights up.',
      'Keep heels flat.'
    ],
    muscle: 'Full Body',
    level: 'Advanced',
    desc: 'Combines a full deep squat with an overhead shoulder press in one highly demanding metabolic lift.'
  },

  // Cardio
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationOrReps: '60 seconds',
    caloriesPerMinute: 8,
    targetMuscles: ['Full Body', 'Cardio'],
    instructions: [
      'Stand with feet together and arms at sides.',
      'Jump feet out while raising arms overhead.',
      'Jump back to start.',
      'Repeat in rapid succession.'
    ],
    formTips: [
      'Land softly on balls of feet.',
      'Maintain a steady breathing pattern.'
    ],
    muscle: 'Full Body',
    level: 'Beginner',
    desc: 'A timeless, full-body metabolic warm-up and conditioning drill raising base circulation quickly.'
  },
  {
    id: 'high_plank_taps',
    name: 'Plank Shoulder Taps',
    category: 'Cardio',
    difficulty: 'Intermediate',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 6,
    targetMuscles: ['Core', 'Shoulders'],
    instructions: [
      'High plank stance, feet wide for stability.',
      'Tap opposite shoulder with hand.',
      'Keep body as still and rigid as possible.',
      'Minimize hip swaying.'
    ],
    formTips: [
      'Keep hips level to the ground.',
      'Squeeze glutes and abs.'
    ],
    muscle: 'Core',
    level: 'Intermediate',
    desc: 'From a rigid high plank posture, slowly raise opposite hands to tap shoulders while avoiding hip rock.'
  },
  {
    id: 'skaters',
    name: 'Lateral Skaters',
    category: 'Cardio',
    difficulty: 'Intermediate',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 10,
    targetMuscles: ['Legs', 'Glutes', 'Cardio'],
    instructions: [
      'Leap to the right, landing on right foot.',
      'Sweep left foot behind right while reaching arm down.',
      'Leap to the left, repeating on other side.',
      'Stay low and explosive.'
    ],
    formTips: [
      'Focus on side-to-side distance.',
      'Keep chest facing forward.'
    ],
    muscle: 'Legs',
    level: 'Intermediate',
    desc: 'Jump laterally from side to side in a skating motion, building agility and outer glute capacity.'
  },
  {
    id: 'shadow_boxing',
    name: 'Shadow Boxing',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationOrReps: '180 seconds',
    caloriesPerMinute: 7,
    targetMuscles: ['Shoulders', 'Core', 'Cardio'],
    instructions: [
      'Stand in boxing stance, knees soft.',
      'Throw light, rapid jabs, crosses, and hooks.',
      'Keep feet moving and stay alert.',
      'Breathe on each punch.'
    ],
    formTips: [
      'Do not lock elbows on punches.',
      'Keep hands up to guard face.'
    ],
    muscle: 'Shoulders',
    level: 'Beginner',
    desc: 'Punch and move dynamically to improve fast coordination, shoulder conditioning, and steady burn.'
  },
  {
    id: 'butt_kicks',
    name: 'Butt Kicks',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 8,
    targetMuscles: ['Legs', 'Hamstrings', 'Cardio'],
    instructions: [
      'Jog in place, kicking heels up to glutes.',
      'Keep knees pointing down.',
      'Pump arms back and forth.',
      'Maintain a fast, springy pace.'
    ],
    formTips: [
      'Keep upper body relaxed.',
      'Engage core for stability.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'A dynamic stretch and cardio drill to wake up posterior leg chains by rapidly kicking heels to glutes.'
  },
  {
    id: 'bicycle_crunches',
    name: 'Bicycle Crunches',
    category: 'Cardio',
    difficulty: 'Intermediate',
    durationOrReps: '3 sets x 20 reps',
    caloriesPerMinute: 6,
    targetMuscles: ['Core', 'Obliques'],
    instructions: [
      'Lie on back, hands behind head.',
      'Lift head and shoulders, pedal legs in air.',
      'Touch opposite elbow to knee, twisting torso.',
      'Slow and controlled movement.'
    ],
    formTips: [
      'Do not pull on your neck.',
      'Extend leg straight out close to floor.'
    ],
    muscle: 'Core',
    level: 'Intermediate',
    desc: 'Supine abdominal rotational twist touching elbow to opposite knees to build complete abdominal control.'
  },
  {
    id: 'star_jumps',
    name: 'Star Jumps',
    category: 'Cardio',
    difficulty: 'Advanced',
    durationOrReps: '30 seconds',
    caloriesPerMinute: 11,
    targetMuscles: ['Full Body', 'Legs', 'Cardio'],
    instructions: [
      'Stand with knees slightly bent.',
      'Jump high, extending arms and legs out in star shape.',
      'Land softly with knees bent.',
      'Immediately repeat.'
    ],
    formTips: [
      'Land with knees soft to absorb shock.',
      'Engage core tightly.'
    ],
    muscle: 'Full Body',
    level: 'Advanced',
    desc: 'Squat and jump high, throwing legs and arms outwards into a wide star shape before landing softly.'
  },
  {
    id: 'fast_feet',
    name: 'Fast Feet',
    category: 'Cardio',
    difficulty: 'Beginner',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 8,
    targetMuscles: ['Legs', 'Calves', 'Cardio'],
    instructions: [
      'Stand with feet wide, knees bent.',
      'Patter feet up and down as fast as possible.',
      'Keep hips low and stay on toes.',
      'Hold arms out for balance.'
    ],
    formTips: [
      'Stay low in athletic stance.',
      'Breathe dynamically.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'An agile, explosive high-frequency foot tapping movement mimicking athletic field agility drills.'
  },

  // Yoga
  {
    id: 'surya_namaskar',
    name: 'Surya Namaskar',
    category: 'Yoga',
    difficulty: 'Intermediate',
    durationOrReps: '60 seconds',
    caloriesPerMinute: 4,
    targetMuscles: ['Full Body', 'Flexibility'],
    instructions: [
      'Combine 12 dynamic poses starting in prayer.',
      'Inhale to arch back, exhale to forward bend.',
      'Step back to lunge, plank, down-dog.',
      'Flow with breath control.'
    ],
    formTips: [
      'Synchronize pose transitions with breath.',
      'Do not force tight hamstrings.'
    ],
    muscle: 'Full Body',
    level: 'Intermediate',
    desc: 'A flow sequence of twelve graceful vinyasa postures that stretch, strengthen and align the system.'
  },
  {
    id: 'downward_dog',
    name: 'Downward-Facing Dog',
    category: 'Yoga',
    difficulty: 'Beginner',
    durationOrReps: '60 seconds',
    caloriesPerMinute: 3,
    targetMuscles: ['Shoulders', 'Legs', 'Hamstrings'],
    instructions: [
      'Start on hands and knees.',
      'Lift hips up and back, forming an inverted V.',
      'Press chest toward thighs, heels toward floor.',
      'Spread fingers wide.'
    ],
    formTips: [
      'Keep spine long, bend knees if needed.',
      'Relax your neck.'
    ],
    muscle: 'Shoulders',
    level: 'Beginner',
    desc: 'Inverted V stance to elongate spinal muscles, stretch back legs, and build deep shoulder strength.'
  },
  {
    id: 'cobra_pose',
    name: 'Cobra Pose',
    category: 'Yoga',
    difficulty: 'Beginner',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 3,
    targetMuscles: ['Back', 'Chest', 'Shoulders'],
    instructions: [
      'Lie face down, hands under shoulders.',
      'Hug elbows close, press tops of feet into floor.',
      'Inhale, lift chest off the mat using back muscles.',
      'Keep gaze forward.'
    ],
    formTips: [
      'Do not push with hands too hard.',
      'Keep shoulders down.'
    ],
    muscle: 'Back',
    level: 'Beginner',
    desc: 'Gentle backward extension that strengthens the spine, expands the lungs, and stretches chest muscles.'
  },
  {
    id: 'warrior_two',
    name: 'Warrior II Pose',
    category: 'Yoga',
    difficulty: 'Beginner',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 4,
    targetMuscles: ['Legs', 'Shoulders'],
    instructions: [
      'Stand with wide legs, turn right foot out.',
      'Bend right knee to 90 degrees.',
      'Stretch arms out parallel to floor.',
      'Gaze over right hand.'
    ],
    formTips: [
      'Keep outer edge of back foot flat.',
      'Squeeze thigh muscles.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'A powerful standing balance pose strengthening lower limbs, expanding the chest, and improving focus.'
  },
  {
    id: 'crow_pose',
    name: 'Crow Pose',
    category: 'Yoga',
    difficulty: 'Advanced',
    durationOrReps: '30 seconds',
    caloriesPerMinute: 5,
    targetMuscles: ['Core', 'Shoulders', 'Arms'],
    instructions: [
      'Squat down, place hands flat on mat.',
      'Place knees high on back of triceps.',
      'Hinge forward shifting weight to hands.',
      'Lift feet off floor balancing on hands.'
    ],
    formTips: [
      'Squeeze knees tight against arms.',
      'Gaze forward, not down.'
    ],
    muscle: 'Core',
    level: 'Advanced',
    desc: 'An arm balance pose targeting shoulder girdle, core contraction, and wrist stability.'
  },
  {
    id: 'tree_pose',
    name: 'Tree Pose',
    category: 'Yoga',
    difficulty: 'Beginner',
    durationOrReps: '45 seconds',
    caloriesPerMinute: 3,
    targetMuscles: ['Legs', 'Core'],
    instructions: [
      'Stand tall on one leg.',
      'Place sole of other foot on inner calf or thigh.',
      'Bring hands to prayer at chest or reach overhead.',
      'Find a static focal point.'
    ],
    formTips: [
      'Avoid placing foot directly on knee joint.',
      'Engage standing leg.'
    ],
    muscle: 'Legs',
    level: 'Beginner',
    desc: 'Classic upright balance posture strengthening stabilizing ankle muscles and training calm mental poise.'
  },
  {
    id: 'plank_pose',
    name: 'Plank Pose',
    category: 'Yoga',
    difficulty: 'Beginner',
    durationOrReps: '60 seconds',
    caloriesPerMinute: 5,
    targetMuscles: ['Core', 'Shoulders'],
    instructions: [
      'High plank with arms fully extended.',
      'Align shoulders, hips, and heels in one line.',
      'Engage core and thigh muscles actively.',
      'Breathe deeply.'
    ],
    formTips: [
      'Keep tailbone tucked.',
      'Press floor away actively.'
    ],
    muscle: 'Core',
    level: 'Beginner',
    desc: 'An isometric posture supporting the entire body in a straight line, training complete shoulder stability.'
  }
];

export default function App() {
  // Views navigation state
  const [view, setView] = useState<'landing' | 'login' | 'onboarding' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'meals' | 'coach' | 'profile'>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro Athlete');

  // Landing page interactive UI states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication & popup states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoginStage, setGoogleLoginStage] = useState<'chooser' | 'input' | 'loading'>('chooser');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Onboarding Wizard states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingDob, setOnboardingDob] = useState('1995-01-01');
  const [onboardingGender, setOnboardingGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  
  // Units and weight/height
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [onboardingWeight, setOnboardingWeight] = useState(70);
  const [onboardingHeight, setOnboardingHeight] = useState(175);
  
  // Goal details
  const [onboardingGoal, setOnboardingGoal] = useState<'Lose Weight' | 'Build Muscle' | 'Stay Fit' | 'Improve Endurance' | 'Gain Weight'>('Lose Weight');
  const [onboardingTargetWeight, setOnboardingTargetWeight] = useState(65);
  const [onboardingTimeline, setOnboardingTimeline] = useState(12); // weeks
  const [onboardingActivityLevel, setOnboardingActivityLevel] = useState<'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active'>('Moderately Active');
  
  // Lifestyle
  const [onboardingDietary, setOnboardingDietary] = useState<'Balanced' | 'Vegan' | 'Vegetarian' | 'Keto' | 'Paleo'>('Balanced');
  const [onboardingAllergies, setOnboardingAllergies] = useState<string[]>(['None']);
  const [onboardingWaterGoal, setOnboardingWaterGoal] = useState(2.5);

  // App shell core tracking states - loaded from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return {
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      height: 178, // in cm
      weight: 71,   // in kg
      dob: '1995-06-15',
      gender: 'Male',
      activityLevel: 'Moderately Active',
      goal: 'Lose Weight',
      targetCalories: 2200,
      macros: { p: 165, c: 248, f: 61 },
      streak: 5,
      onboardingComplete: false
    };
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('geminiApiKey') || '';
  });
  const [testingKey, setTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!geminiApiKey.trim()) return;
    setTestingKey(true);
    setTestStatus(null);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Hello" }]
            }
          ]
        })
      });
      
      if (response.ok) {
        setTestStatus({ type: 'success', message: 'Connection successful!' });
      } else {
        setTestStatus({ type: 'error', message: 'Connection failed. Please check your API key.' });
      }
    } catch (err) {
      setTestStatus({ type: 'error', message: 'Connection failed. Network error.' });
    } finally {
      setTestingKey(false);
    }
  };

  const [caloriesConsumed, setCaloriesConsumed] = useState(() => {
    const stored = localStorage.getItem('caloriesConsumed');
    return stored ? parseInt(stored) : 1840;
  });

  const [hydrationConsumed, setHydrationConsumed] = useState(() => {
    const stored = localStorage.getItem('hydrationConsumed');
    return stored ? parseFloat(stored) : 1.8;
  });

  const [activeMinutes, setActiveMinutes] = useState(() => {
    const stored = localStorage.getItem('activeMinutes');
    return stored ? parseInt(stored) : 45;
  });

  const [customMeals, setCustomMeals] = useState<Array<{ name: string; cal: number; time: string }>>(() => {
    const stored = localStorage.getItem('customMeals');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      { name: 'Avocado Toast & Eggs', cal: 480, time: '08:15 AM' },
      { name: 'Grilled Salmon & Quinoa', cal: 620, time: '01:30 PM' },
      { name: 'Greek Yogurt with Almonds', cal: 240, time: '04:45 PM' }
    ];
  });

  // Persist to localStorage via useEffect
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('caloriesConsumed', caloriesConsumed.toString());
  }, [caloriesConsumed]);

  useEffect(() => {
    localStorage.setItem('hydrationConsumed', hydrationConsumed.toString());
  }, [hydrationConsumed]);

  useEffect(() => {
    localStorage.setItem('activeMinutes', activeMinutes.toString());
  }, [activeMinutes]);

  useEffect(() => {
    localStorage.setItem('customMeals', JSON.stringify(customMeals));
  }, [customMeals]);

  // Mifflin-St Jeor and Macros Calculator
  const calculateCaloriesAndMacros = (
    weightKg: number,
    heightCm: number,
    dob: string,
    gender: string,
    activityLevel: string,
    goal: string
  ) => {
    let age = 30; // fallback
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // MSJ Formula BMR
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'Male') {
      bmr += 5;
    } else if (gender === 'Female') {
      bmr -= 161;
    } else {
      bmr -= 78; // neutral inclusivity average
    }

    // Activity multiplier
    let multiplier = 1.2;
    if (activityLevel === 'Lightly Active') multiplier = 1.375;
    else if (activityLevel === 'Moderately Active') multiplier = 1.55;
    else if (activityLevel === 'Very Active') multiplier = 1.725;

    let calories = Math.round(bmr * multiplier);

    // Goal adjustment
    if (goal === 'Lose Weight') {
      calories -= 500;
    } else if (goal === 'Gain Weight' || goal === 'Build Muscle') {
      calories += 300;
    }
    
    if (calories < 1200) calories = 1200; // safe metabolic minimum

    // Macros: 30% Protein, 45% Carbs, 25% Fats
    const proteinGrams = Math.round((calories * 0.30) / 4);
    const carbsGrams = Math.round((calories * 0.45) / 4);
    const fatsGrams = Math.round((calories * 0.25) / 9);

    return {
      calories,
      macros: {
        p: proteinGrams,
        c: carbsGrams,
        f: fatsGrams
      }
    };
  };

  // BMI calculations for onboarding
  const computedOnboardingBMI = useMemo(() => {
    const hCm = heightUnit === 'cm' ? onboardingHeight : onboardingHeight * 2.54;
    const wKg = weightUnit === 'kg' ? onboardingWeight : onboardingWeight * 0.45359237;
    if (!hCm || !wKg) return 0;
    const hM = hCm / 100;
    return parseFloat((wKg / (hM * hM)).toFixed(1));
  }, [onboardingHeight, heightUnit, onboardingWeight, weightUnit]);

  const computedOnboardingBMIStatus = useMemo(() => {
    const bmi = computedOnboardingBMI;
    if (bmi === 0) return { text: 'N/A', color: 'text-gray-400 bg-gray-150/10' };
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (bmi < 25) return { text: 'Healthy', color: 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    return { text: 'Obese', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  }, [computedOnboardingBMI]);

  // Unit toggles
  const handleToggleWeightUnit = (unit: 'kg' | 'lb') => {
    if (unit === weightUnit) return;
    if (unit === 'lb') {
      setOnboardingWeight(prev => Math.round(prev * 2.20462262));
      setOnboardingTargetWeight(prev => Math.round(prev * 2.20462262));
    } else {
      setOnboardingWeight(prev => Math.round(prev * 0.45359237));
      setOnboardingTargetWeight(prev => Math.round(prev * 0.45359237));
    }
    setWeightUnit(unit);
  };

  const handleToggleHeightUnit = (unit: 'cm' | 'in') => {
    if (unit === heightUnit) return;
    if (unit === 'in') {
      setOnboardingHeight(prev => Math.round(prev * 0.39370079));
    } else {
      setOnboardingHeight(prev => Math.round(prev * 2.54));
    }
    setHeightUnit(unit);
  };

  // Toggle allergy
  const handleToggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setOnboardingAllergies(['None']);
      return;
    }
    setOnboardingAllergies(prev => {
      let filtered = prev.filter(a => a !== 'None');
      if (filtered.includes(allergy)) {
        filtered = filtered.filter(a => a !== allergy);
        if (filtered.length === 0) return ['None'];
        return filtered;
      } else {
        return [...filtered, allergy];
      }
    });
  };

  // Login actions
  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest User',
      email: 'guest@healthifyyou.com',
      height: 175,
      weight: 70,
      dob: '1995-01-01',
      gender: 'Male' as const,
      activityLevel: 'Moderately Active' as const,
      goal: 'Lose Weight' as const,
      targetCalories: 2000,
      macros: { p: 150, c: 225, f: 56 },
      streak: 5,
      onboardingComplete: false
    };
    
    setOnboardingName(guestUser.name);
    setOnboardingDob(guestUser.dob);
    setOnboardingGender(guestUser.gender);
    setOnboardingWeight(guestUser.weight);
    setOnboardingHeight(guestUser.height);
    setWeightUnit('kg');
    setHeightUnit('cm');
    
    setUserProfile(guestUser);
    setView('onboarding');
    setOnboardingStep(1);
  };

  const handleGoogleAccountSelect = (name: string, email: string) => {
    setGoogleLoginStage('loading');
    setTimeout(() => {
      const googleUser = {
        name,
        email,
        height: 175,
        weight: 70,
        dob: '1995-01-01',
        gender: 'Male' as const,
        activityLevel: 'Moderately Active' as const,
        goal: 'Lose Weight' as const,
        targetCalories: 2000,
        macros: { p: 150, c: 225, f: 56 },
        streak: 5,
        onboardingComplete: false
      };
      
      setOnboardingName(googleUser.name);
      setOnboardingDob(googleUser.dob);
      setOnboardingGender(googleUser.gender);
      setOnboardingWeight(googleUser.weight);
      setOnboardingHeight(googleUser.height);
      setWeightUnit('kg');
      setHeightUnit('cm');
      
      setUserProfile(googleUser);
      setShowGoogleModal(false);
      setGoogleLoginStage('chooser');
      setView('onboarding');
      setOnboardingStep(1);
    }, 1200);
  };

  const handleCustomGoogleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customGoogleName || !customGoogleEmail) return;
    handleGoogleAccountSelect(customGoogleName, customGoogleEmail);
  };

  // Onboarding actions
  const handleOnboardingComplete = () => {
    const finalWeightKg = weightUnit === 'kg' ? onboardingWeight : Math.round(onboardingWeight * 0.45359237);
    const finalHeightCm = heightUnit === 'cm' ? onboardingHeight : Math.round(onboardingHeight * 2.54);
    
    const results = calculateCaloriesAndMacros(
      finalWeightKg,
      finalHeightCm,
      onboardingDob,
      onboardingGender,
      onboardingActivityLevel,
      onboardingGoal
    );
    
    const completedProfile = {
      ...userProfile,
      name: onboardingName || userProfile.name || 'Alex Johnson',
      weight: finalWeightKg,
      height: finalHeightCm,
      dob: onboardingDob,
      gender: onboardingGender,
      weightUnit,
      heightUnit,
      activityLevel: onboardingActivityLevel,
      goal: onboardingGoal,
      targetCalories: results.calories,
      macros: results.macros,
      dietaryPreference: onboardingDietary,
      allergies: onboardingAllergies,
      waterGoal: onboardingWaterGoal,
      streak: userProfile.streak || 5,
      onboardingComplete: true
    };
    
    setUserProfile(completedProfile);
    
    // Reset daily log indicators
    setCaloriesConsumed(0);
    setHydrationConsumed(0);
    setActiveMinutes(0);
    setCustomMeals([]);
    
    setView('app');
  };

  // Get Started / Join Flow Router
  const handleGetStarted = () => {
    const stored = localStorage.getItem('userProfile');
    if (!stored) {
      setView('login');
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.onboardingComplete) {
          setView('app');
        } else {
          setView('onboarding');
        }
      } catch (e) {
        setView('login');
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('caloriesConsumed');
    localStorage.removeItem('hydrationConsumed');
    localStorage.removeItem('activeMinutes');
    localStorage.removeItem('customMeals');
    
    setUserProfile({
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      height: 178,
      weight: 71,
      targetCalories: 2200,
      streak: 5,
      onboardingComplete: false
    });
    setCaloriesConsumed(0);
    setHydrationConsumed(0);
    setActiveMinutes(0);
    setCustomMeals([]);
    
    setView('landing');
  };

  // Calculations for BMI
  const bmiValue = useMemo(() => {
    const heightInMeters = userProfile.height / 100;
    return parseFloat((userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }, [userProfile.height, userProfile.weight]);

  const bmiStatus = useMemo(() => {
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-amber-400' };
    if (bmiValue < 25) return { text: 'Fit / Normal', color: 'text-[#00C853]' };
    if (bmiValue < 30) return { text: 'Overweight', color: 'text-orange-400' };
    return { text: 'Obese', color: 'text-red-400' };
  }, [bmiValue]);

  // Workout state
  const [workoutFilter, setWorkoutFilter] = useState('All');
  const [workoutSearch, setWorkoutSearch] = useState('');
  const [workoutPlanStatus, setWorkoutPlanStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  // Persistence for workoutHistory
  const [workoutHistory, setWorkoutHistory] = useState<Array<{ name: string; category: string; duration: number; calories: number; date: string; stars?: number }>>(() => {
    const stored = localStorage.getItem('workoutHistory');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      { name: 'Morning Cardio Shred', category: 'Cardio', duration: 25, calories: 180, date: 'Today', stars: 5 },
      { name: 'Lower Body Strength', category: 'Strength', duration: 35, calories: 240, date: 'Yesterday', stars: 4 },
      { name: 'Core Stabilizer Lift', category: 'Strength', duration: 15, calories: 110, date: 'Jul 9, 2026', stars: 5 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Persistence for workoutPlan
  const [workoutPlan, setWorkoutPlan] = useState<any | null>(() => {
    const stored = localStorage.getItem('workoutPlan');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    }
  }, [workoutPlan]);

  const [workoutSubView, setWorkoutSubView] = useState<'home' | 'detail' | 'session' | 'weeklyPlan'>('home');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [expandedPlanDay, setExpandedPlanDay] = useState<number | null>(null);

  // Meals state
  const [mealDietGoal, setMealDietGoal] = useState('Balanced');
  const [mealGeneratorStatus, setMealGeneratorStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any | null>(null);

  // Nutrition scanner state
  const [mealInput, setMealInput] = useState('');
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'scanning' | 'ready'>('idle');
  const [scannedResult, setScannedResult] = useState<any | null>(null);

  // Helper to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State for active selected meal date (defaults to today)
  const [selectedMealDate, setSelectedMealDate] = useState(() => formatDateToYYYYMMDD(new Date()));

  // Active view in Meals tab ('tracker' or 'weekly')
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

  // Recent foods
  const [recentFoods, setRecentFoods] = useState<any[]>(() => {
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
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<any | null>(null);
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

  // Persists to localStorage via useEffects
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

  // Synchronize caloriesConsumed and hydrationConsumed with the selected meal date log
  useEffect(() => {
    const todayLog = mealHistory[selectedMealDate] || {
      breakfast: [],
      morningSnack: [],
      lunch: [],
      eveningSnack: [],
      dinner: [],
      water: 0
    };
    
    const mealKeys = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'] as const;
    let totalCal = 0;
    mealKeys.forEach(key => {
      const list = todayLog[key] || [];
      list.forEach((item: any) => {
        totalCal += Math.round(item.calories * item.portionMultiplier);
      });
    });
    
    setCaloriesConsumed(totalCal);
    setHydrationConsumed((todayLog.water || 0) / 1000);
  }, [mealHistory, selectedMealDate]);

  // Helper functions for logging meals
  const logFoodToMeal = (food: any, slot: 'breakfast' | 'morningSnack' | 'lunch' | 'eveningSnack' | 'dinner', multiplier: number) => {
    const dateKey = selectedMealDate;
    
    const loggedItem = {
      loggedId: `logged_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      id: food.id || `custom_${Date.now()}`,
      name: food.name,
      category: food.category || 'Custom',
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
          id: food.id || `custom_${Date.now()}`,
          name: food.name,
          category: food.category || 'Custom',
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

  // Helper to toggle favorites
  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoods(prev => {
      if (prev.includes(foodId)) {
        return prev.filter(id => id !== foodId);
      } else {
        return [...prev, foodId];
      }
    });
  };

  // Chatbot Coach state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'coach'; text: string; time: string }>>([
    {
      sender: 'coach',
      text: "Hello Alex! I am your AI Health Companion. I've synced your metrics, calculated your target metabolism, and analyzed your Fitbit loops. How can I guide your workout, meal plan, or daily vitals today?",
      time: '10:00 AM'
    }
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const [coachIsThinking, setCoachIsThinking] = useState(false);

  // Auto scroll chat to bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, coachIsThinking]);

  // Custom meal modal or direct add
  const [quickMealName, setQuickMealName] = useState('');
  const [quickMealCal, setQuickMealCal] = useState('');

  // Predefined workout routines based on AI generation
  const generatedWorkoutRoutines = [
    { name: 'Squat Jumps', reps: '3 sets x 12 reps', status: 'legs' },
    { name: 'Pike Push-ups', reps: '3 sets x 10 reps', status: 'chest' },
    { name: 'Bicycle Crunches', reps: '4 sets x 20 reps', status: 'core' },
    { name: 'Superman Extensions', reps: '3 sets x 15 reps', status: 'back' }
  ];

  // Quick prompt buttons for Coach
  const COACH_QUICK_PROMPTS = [
    "Give me a fast leg workout",
    "What is a smart low-calorie snack?",
    "Tips to boost my Fitbit active minutes?",
    "How does my current BMI affect my target calories?"
  ];

  // Smart dynamic responder for simulated AI coach
  const getCoachResponse = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('leg') || q.includes('workout')) {
      return `Here is a custom leg burner for you, Alex:\n1. Bodyweight Squats - 4 sets x 15 reps\n2. Reverse Lunges - 3 sets x 12 reps per leg\n3. Glute Bridges - 3 sets x 15 reps.\nThis routine will take about 15 minutes, burn ~120 kcal, and add valuable Active Minutes to your Fitbit dashboard!`;
    }
    if (q.includes('snack') || q.includes('calorie') || q.includes('eat') || q.includes('food')) {
      return `For a smart low-calorie snack under 150 kcal:\n- Greek Yogurt (100g) with a sprinkle of blueberries (85 kcal, high protein!)\n- Cucumber slices with 2 tbsp of hummus (110 kcal)\n- A handful of raw almonds (12 nuts, ~90 kcal).\nThese will keep your metabolism active without exceeding your ${userProfile.targetCalories} kcal daily budget!`;
    }
    if (q.includes('fitbit') || q.includes('active') || q.includes('minute')) {
      return `To hit your 60-minute daily goal from your current ${activeMinutes} minutes:\n- Take a fast 15-minute power walk right after lunch\n- Do 50 jumping jacks between meetings\n- Try our 'AI Suggested Workout' in the Workout Tab. Keeping your heart rate elevated for even 10 consecutive minutes triggers Fitbit active zones!`;
    }
    if (q.includes('bmi') || q.includes('calories') || q.includes('height') || q.includes('weight')) {
      return `Your BMI is currently ${bmiValue}, which ranks you in the '${bmiStatus.text}' tier. Given your weight of ${userProfile.weight}kg and height of ${userProfile.height}cm, your daily metabolic baseline requires approximately 1,600 kcal. Adding a targeted surplus for physical training puts your optimized intake at ${userProfile.targetCalories} kcal. This creates a safe, healthy balance!`;
    }
    return `Excellent question! Your current hydration is at ${hydrationConsumed}L (target 2.5L) and you have consumed ${caloriesConsumed} kcal out of your ${userProfile.targetCalories} kcal budget today. To optimize your physical output, I suggest focusing on premium hydration and performing a steady 20-minute cardio routine. Let me know if you want a custom plan for that!`;
  };

  // Actions
  const handleLogQuickMeal = (e: FormEvent) => {
    e.preventDefault();
    if (!quickMealName || !quickMealCal) return;
    const calories = parseInt(quickMealCal);
    if (isNaN(calories)) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCustomMeals([{ name: quickMealName, cal: calories, time: timeStr }, ...customMeals]);
    setCaloriesConsumed(prev => prev + calories);
    setQuickMealName('');
    setQuickMealCal('');
  };

  const handleDrinkWater = () => {
    setHydrationConsumed(prev => {
      const next = parseFloat((prev + 0.25).toFixed(2));
      return next > 3.5 ? 3.5 : next;
    });
  };

  const handleStartWorkout = (mins: number) => {
    setActiveMinutes(prev => Math.min(60, prev + mins));
    setWorkoutHistory([
      { name: 'Interactive Training Blast', duration: mins, calories: mins * 7, date: 'Just now' },
      ...workoutHistory
    ]);
  };

  // 1. Weekly plan generator
  const generateWeeklyPlan = (goal: string, activityLevel: string) => {
    setWorkoutPlanStatus('generating');
    setTimeout(() => {
      const activeDaysCount = activityLevel === 'Sedentary' ? 3 :
                              activityLevel === 'Light' || activityLevel === 'Lightly Active' ? 3 :
                              activityLevel === 'Moderate' || activityLevel === 'Moderately Active' ? 4 :
                              activityLevel === 'Very Active' ? 5 : 4;

      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // Decide active days based on count
      let activeDaysFlags = [true, false, true, false, true, false, false]; // 3 days: Mon, Wed, Fri
      if (activeDaysCount === 4) {
        activeDaysFlags = [true, false, true, false, true, true, false]; // 4 days: Mon, Wed, Fri, Sat
      } else if (activeDaysCount >= 5) {
        activeDaysFlags = [true, true, false, true, true, true, false]; // 5 days: Mon, Tue, Thu, Fri, Sat
      }

      // Define categories to prioritize
      let primaryCat = 'Strength';
      let secondaryCat = 'Cardio';
      let tertiaryCat = 'Yoga';

      if (goal === 'Lose Weight') {
        primaryCat = 'Cardio';
        secondaryCat = 'HIIT';
        tertiaryCat = 'Strength';
      } else if (goal === 'Build Muscle') {
        primaryCat = 'Strength';
        secondaryCat = 'HIIT';
        tertiaryCat = 'Yoga';
      } else if (goal === 'Stay Fit') {
        primaryCat = 'Strength';
        secondaryCat = 'Cardio';
        tertiaryCat = 'Yoga';
      } else if (goal === 'Improve Endurance') {
        primaryCat = 'Cardio';
        secondaryCat = 'HIIT';
        tertiaryCat = 'Yoga';
      } else if (goal === 'Gain Weight') {
        primaryCat = 'Strength';
        secondaryCat = 'Cardio';
        tertiaryCat = 'Yoga';
      }

      // Filter exercises by category for easy selection
      const strengthExs = EXERCISES_LIBRARY.filter(e => e.category === 'Strength');
      const cardioExs = EXERCISES_LIBRARY.filter(e => e.category === 'Cardio');
      const yogaExs = EXERCISES_LIBRARY.filter(e => e.category === 'Yoga');
      const hiitExs = EXERCISES_LIBRARY.filter(e => e.category === 'HIIT');

      const plan = daysOfWeek.map((dayName, index) => {
        const isActive = activeDaysFlags[index];
        if (!isActive) {
          // Active Recovery / Rest Day
          // Pick 2 relaxing Yoga poses
          const yogaIndex1 = (index * 2) % yogaExs.length;
          const yogaIndex2 = (index * 2 + 1) % yogaExs.length;
          return {
            dayName,
            isRestDay: true,
            title: 'Active Recovery & Flexibility',
            exercises: [yogaExs[yogaIndex1], yogaExs[yogaIndex2]]
          };
        }

        // Active Training Day
        let dayTheme = '';
        let dayExercises: typeof EXERCISES_LIBRARY = [];

        if (index === 0) { // Monday
          dayTheme = `${primaryCat} Focus Day`;
          const sourceList = primaryCat === 'Strength' ? strengthExs : cardioExs;
          dayExercises = [sourceList[0], sourceList[1], sourceList[2]];
        } else if (index === 1) { // Tuesday
          dayTheme = `${secondaryCat} Conditioning`;
          const sourceList = secondaryCat === 'HIIT' ? hiitExs : cardioExs;
          dayExercises = [sourceList[0], sourceList[1], sourceList[2]];
        } else if (index === 2) { // Wednesday
          dayTheme = `${tertiaryCat} Balance & Core`;
          const sourceList = tertiaryCat === 'Yoga' ? yogaExs : strengthExs;
          dayExercises = [sourceList[0], sourceList[1], sourceList[2]];
        } else if (index === 3) { // Thursday
          dayTheme = `High-Intensity Explosive HIIT`;
          dayExercises = [hiitExs[0], hiitExs[1], hiitExs[2]];
        } else if (index === 4) { // Friday
          dayTheme = `Hybrid Power & Endurance`;
          const source1 = primaryCat === 'Strength' ? strengthExs : cardioExs;
          const source2 = secondaryCat === 'HIIT' ? hiitExs : yogaExs;
          dayExercises = [source1[1], source2[1], source1[2]];
        } else { // Saturday
          dayTheme = `Full Body MetCon Burner`;
          dayExercises = [strengthExs[2], hiitExs[2], cardioExs[2]];
        }

        // Add Warm-up (Jumping Jacks) and Cool-down (Cobra Pose)
        const warmUp = EXERCISES_LIBRARY.find(e => e.id === 'jumping_jacks') || EXERCISES_LIBRARY[15];
        const coolDown = EXERCISES_LIBRARY.find(e => e.id === 'cobra_pose') || EXERCISES_LIBRARY[25];

        // Ensure no duplicates
        const filteredMain = dayExercises.filter(e => e.id !== warmUp.id && e.id !== coolDown.id);

        return {
          dayName,
          isRestDay: false,
          title: dayTheme,
          exercises: [warmUp, ...filteredMain, coolDown]
        };
      });

      setWorkoutPlan(plan);
      setWorkoutPlanStatus('ready');
      setWorkoutSubView('weeklyPlan');
    }, 1200);
  };

  // 2. Active Session logic
  const handleStartWorkoutSession = (exercise: typeof EXERCISES_LIBRARY[0]) => {
    const isTimed = exercise.durationOrReps.toLowerCase().includes('seconds') || 
                    exercise.durationOrReps.toLowerCase().includes('minutes') || 
                    exercise.durationOrReps.toLowerCase().includes('round');
    
    let initialTime = 45;
    if (exercise.durationOrReps.includes('30')) initialTime = 30;
    else if (exercise.durationOrReps.includes('40')) initialTime = 40;
    else if (exercise.durationOrReps.includes('60') || exercise.name.includes('Surya Namaskar')) initialTime = 60;
    else if (exercise.durationOrReps.includes('180') || exercise.durationOrReps.includes('3 minutes')) initialTime = 180;

    setActiveSession({
      exercise,
      isPaused: false,
      timeRemaining: initialTime,
      initialTime,
      elapsedSeconds: 0,
      repCount: 12,
      setCount: 1,
      totalSets: 3,
      sessionCalories: 0,
      restTimeRemaining: 0,
      restDuration: 30,
      isTimed
    });
    setWorkoutSubView('session');
  };

  // Set up the workout session ticking interval
  useEffect(() => {
    if (activeTab !== 'workouts' || workoutSubView !== 'session' || !activeSession) return;

    const interval = setInterval(() => {
      setActiveSession((prev: any) => {
        if (!prev) return null;
        if (prev.isPaused) return prev;

        const nextElapsed = prev.elapsedSeconds + 1;
        const nextCalories = parseFloat(((prev.exercise.caloriesPerMinute * nextElapsed) / 60).toFixed(1));

        // Rest timer is counting down
        if (prev.restTimeRemaining > 0) {
          const nextRest = prev.restTimeRemaining - 1;
          if (nextRest === 0) {
            const nextSet = prev.setCount + 1;
            if (nextSet > prev.totalSets) {
              return {
                ...prev,
                restTimeRemaining: 0,
                elapsedSeconds: nextElapsed,
                sessionCalories: nextCalories
              };
            } else {
              return {
                ...prev,
                restTimeRemaining: 0,
                setCount: nextSet,
                timeRemaining: prev.initialTime,
                elapsedSeconds: nextElapsed,
                sessionCalories: nextCalories
              };
            }
          }
          return {
            ...prev,
            restTimeRemaining: nextRest,
            elapsedSeconds: nextElapsed,
            sessionCalories: nextCalories
          };
        }

        // Active timed counting down
        if (prev.isTimed) {
          const nextTime = prev.timeRemaining - 1;
          if (nextTime <= 0) {
            if (prev.setCount < prev.totalSets) {
              return {
                ...prev,
                timeRemaining: 0,
                restTimeRemaining: prev.restDuration,
                elapsedSeconds: nextElapsed,
                sessionCalories: nextCalories
              };
            } else {
              return {
                ...prev,
                timeRemaining: 0,
                isPaused: true,
                elapsedSeconds: nextElapsed,
                sessionCalories: nextCalories
              };
            }
          }
          return {
            ...prev,
            timeRemaining: nextTime,
            elapsedSeconds: nextElapsed,
            sessionCalories: nextCalories
          };
        }

        // Rep-based just increments elapsed seconds and calories
        return {
          ...prev,
          elapsedSeconds: nextElapsed,
          sessionCalories: nextCalories
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, workoutSubView, activeSession !== null]);

  // Complete a set and auto-start rest
  const handleCompleteSet = () => {
    if (!activeSession) return;
    if (activeSession.setCount < activeSession.totalSets) {
      setActiveSession((prev: any) => ({
        ...prev,
        restTimeRemaining: prev.restDuration
      }));
    } else {
      // Last set completed! Pause and prepare to finish
      setActiveSession((prev: any) => ({
        ...prev,
        isPaused: true
      }));
    }
  };

  // Finish session
  const handleFinishWorkoutSession = (rating: number) => {
    if (!activeSession) return;

    const duration = Math.ceil(activeSession.elapsedSeconds / 60) || 1;
    const caloriesBurned = Math.round(activeSession.sessionCalories) || 5;

    const newLog = {
      name: activeSession.exercise.name,
      category: activeSession.exercise.category,
      duration,
      calories: caloriesBurned,
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      stars: rating
    };

    setWorkoutHistory((prev: any) => [newLog, ...prev]);
    setActiveMinutes((prev: number) => Math.min(120, prev + duration));
    setCaloriesConsumed((prev: number) => prev + caloriesBurned); // Add to active daily burn metrics!

    setActiveSession(null);
    setWorkoutSubView('home');
    setSessionRating(5);
  };

  // Pick suggestions
  const getAISuggestedExercise = (goal: string) => {
    if (goal === 'Lose Weight') {
      return EXERCISES_LIBRARY.find(e => e.id === 'burpees') || EXERCISES_LIBRARY[8];
    } else if (goal === 'Build Muscle') {
      return EXERCISES_LIBRARY.find(e => e.id === 'push_ups') || EXERCISES_LIBRARY[0];
    } else if (goal === 'Stay Fit') {
      return EXERCISES_LIBRARY.find(e => e.id === 'plank_pose') || EXERCISES_LIBRARY[29];
    } else if (goal === 'Improve Endurance') {
      return EXERCISES_LIBRARY.find(e => e.id === 'mountain_climbers') || EXERCISES_LIBRARY[9];
    } else if (goal === 'Gain Weight') {
      return EXERCISES_LIBRARY.find(e => e.id === 'squats') || EXERCISES_LIBRARY[1];
    }
    return EXERCISES_LIBRARY[0];
  };

  const generateAIWorkout = () => {
    setWorkoutPlanStatus('generating');
    setTimeout(() => {
      setWorkoutPlanStatus('ready');
      setCheckedExercises({});
    }, 1200);
  };

  const toggleWorkoutExercise = (name: string, durationMins: number) => {
    setCheckedExercises(prev => {
      const updated = { ...prev, [name]: !prev[name] };
      // If checked, reward active minutes and log calories
      if (updated[name]) {
        setActiveMinutes(m => Math.min(120, m + durationMins));
        setCaloriesConsumed(c => c + 40); // small active burn representation
      } else {
        setActiveMinutes(m => Math.max(0, m - durationMins));
        setCaloriesConsumed(c => Math.max(0, c - 40));
      }
      return updated;
    });
  };

  const generateMealPlan = () => {
    setMealGeneratorStatus('generating');
    setTimeout(() => {
      const plans: Record<string, any> = {
        Balanced: {
          b: 'Blueberry Oatmeal with Whey Protein (410 kcal)',
          l: 'Turkey & Spinach Wholewheat Wrap with Avocado (540 kcal)',
          s: 'Spiced Apple slices with 1 tbsp Peanut butter (180 kcal)',
          d: 'Grilled Salmon with Quinoa & Steamed Broccoli (610 kcal)',
          macros: { p: '120g', c: '185g', f: '65g' }
        },
        'Gain Muscle': {
          b: '4 Scrambled Egg Whites, 2 Whole Eggs & Large Bowl of Oats (620 kcal)',
          l: 'Double Chicken Breast, Sweet Potato & Asparagus (750 kcal)',
          s: 'Whey Protein Shake & 1 Large Banana (310 kcal)',
          d: 'Lean Beef Sirloin Steak, Brown Rice & Brussels Sprouts (680 kcal)',
          macros: { p: '185g', c: '230g', f: '75g' }
        },
        Ketogenic: {
          b: 'Crispy Bacon, 3 Eggs Fried in Butter & Sliced Avocado (680 kcal)',
          l: 'Baked Salmon with Olive Oil Pesto & Zucchini Noodles (580 kcal)',
          s: 'Macadamia nuts (40g) & Celery with Cream Cheese (250 kcal)',
          d: 'Grilled Ribeye Steak with Garlic Herb Butter & Spinach (740 kcal)',
          macros: { p: '135g', c: '22g', f: '180g' }
        },
        'Fat Loss': {
          b: 'Egg White Frittata with Tomatoes & Spinach (240 kcal)',
          l: 'Light Tuna Salad over mixed baby greens with Vinaigrette (360 kcal)',
          s: 'Fat-Free Cottage Cheese with sliced Cucumber (110 kcal)',
          d: 'Bake Lemon Herb Cod fillet with roasted Cauliflower (390 kcal)',
          macros: { p: '115g', c: '95g', f: '35g' }
        }
      };
      setGeneratedMealPlan(plans[mealDietGoal]);
      setMealGeneratorStatus('ready');
    }, 1000);
  };

  const analyzeMealText = (e: FormEvent) => {
    e.preventDefault();
    if (!mealInput) return;
    setScanningStatus('scanning');
    setTimeout(() => {
      const query = mealInput.toLowerCase();
      let result = {
        name: mealInput,
        cal: 420,
        p: '25g',
        c: '45g',
        f: '14g',
        rating: 'B',
        tip: 'Balanced dish, consider drinking more water to process proteins.'
      };

      if (query.includes('burger') || query.includes('fries') || query.includes('pizza')) {
        result = {
          name: mealInput,
          cal: 850,
          p: '32g',
          c: '95g',
          f: '38g',
          rating: 'D',
          tip: 'High in sodium and saturated fats. Try pairing with a leafy green salad.'
        };
      } else if (query.includes('salad') || query.includes('chicken') || query.includes('fish')) {
        result = {
          name: mealInput,
          cal: 380,
          p: '42g',
          c: '15g',
          f: '11g',
          rating: 'A',
          tip: 'Superb high-protein option! Fits perfectly with your training requirements.'
        };
      } else if (query.includes('egg') || query.includes('toast') || query.includes('avocado')) {
        result = {
          name: mealInput,
          cal: 460,
          p: '21g',
          c: '38g',
          f: '19g',
          rating: 'A',
          tip: 'Healthy unsaturated fats and solid protein density. Great fuel!'
        };
      }

      setScannedResult(result);
      setScanningStatus('ready');
    }, 1200);
  };

  const handleAddScannedToCal = () => {
    if (!scannedResult) return;
    setCaloriesConsumed(prev => prev + scannedResult.cal);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomMeals([{ name: scannedResult.name, cal: scannedResult.cal, time: timeStr }, ...customMeals]);
    setScannedResult(null);
    setMealInput('');
    setScanningStatus('idle');
  };

  const handleSendCoachMsg = (textToSend?: string) => {
    const msg = textToSend || chatInputText;
    if (!msg.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: 'user', text: msg, time: timeStr }]);
    if (!textToSend) setChatInputText('');

    setCoachIsThinking(true);
    setTimeout(() => {
      const responseText = getCoachResponse(msg);
      setChatMessages(prev => [...prev, { sender: 'coach', text: responseText, time: timeStr }]);
      setCoachIsThinking(false);
    }, 1000);
  };

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    const results = calculateCaloriesAndMacros(
      userProfile.weight,
      userProfile.height,
      userProfile.dob || '1995-01-01',
      userProfile.gender || 'Male',
      userProfile.activityLevel || 'Moderately Active',
      userProfile.goal || 'Lose Weight'
    );
    setUserProfile(prev => ({
      ...prev,
      targetCalories: results.calories,
      macros: results.macros
    }));
    alert("Profile metrics successfully updated! Your metabolic target has been auto-calibrated to " + results.calories + " kcal with protein: " + results.macros.p + "g, carbs: " + results.macros.c + "g, fats: " + results.macros.f + "g.");
  };

  const handleSelectPlanAndActivate = (planName: string) => {
    setSelectedPlan(planName);
    handleGetStarted();
  };

  // Filtered exercises list for the manual log library
  const filteredExercises = useMemo(() => {
    return EXERCISES_LIBRARY.filter(ex => {
      const matchesCategory = workoutFilter === 'All' || ex.category === workoutFilter;
      const matchesSearch = ex.name.toLowerCase().includes(workoutSearch.toLowerCase()) ||
                            ex.desc.toLowerCase().includes(workoutSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [workoutFilter, workoutSearch]);

  return (
    <div id="root" className="min-h-screen font-sans bg-[#1A1A2E] text-white selection:bg-[#00C853] selection:text-white overflow-x-hidden">
      
      {/* VIEW 1 — LANDING PAGE */}
      {view === 'landing' && (
        <div id="view-landing" className="flex flex-col min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#2D1B4E] to-[#1A1A2E]">
          
          {/* Sticky Navbar */}
          <nav id="navbar" className="sticky top-0 z-50 backdrop-blur-md bg-[#1A1A2E]/80 border-b border-white/10 px-4 md:px-8 py-4 transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-10 h-10 bg-[#00C853] rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-[#00C853]/20 text-lg">
                  H
                </div>
                <span className="text-xl md:text-2xl font-black tracking-tight">
                  Healthify<span className="text-[#00C853]">You</span>
                </span>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
                <a href="#features" className="hover:text-[#BFFF00] transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-[#BFFF00] transition-colors">How it Works</a>
                <a href="#pricing" className="hover:text-[#BFFF00] transition-colors">Pricing</a>
                <a href="#testimonials" className="hover:text-[#BFFF00] transition-colors">Stories</a>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  id="nav-get-started"
                  onClick={handleGetStarted}
                  className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#00C853]/30 hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg text-white"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Nav Drawer */}
            {mobileMenuOpen && (
              <div id="mobile-drawer" className="md:hidden absolute top-full left-0 w-full bg-[#1A1A2E]/95 border-b border-white/10 backdrop-blur-lg px-6 py-8 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#BFFF00]">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#BFFF00]">How it Works</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#BFFF00]">Pricing</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-[#BFFF00]">Success Stories</a>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleGetStarted(); }}
                  className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg text-center"
                >
                  Get Started Now
                </button>
              </div>
            )}
          </nav>

          {/* Full-Viewport Hero Section */}
          <header className="relative overflow-hidden pt-12 pb-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
            <div className="lg:col-span-6 flex flex-col space-y-6 md:space-y-8 text-left">
              
              <div className="inline-flex items-center gap-2 bg-[#00C853]/15 border border-[#00C853]/30 px-3.5 py-1.5 rounded-full text-[#00C853] text-xs font-bold tracking-wide w-fit animate-pulse">
                <Sparkles size={14} /> NEW: FITBIT CONTINUOUS FEEDBACK LOOP
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Your AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#BFFF00]">
                  Health Companion
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-lg leading-relaxed">
                Personalized workout planners, metabolic food logs, and an adaptive Fitbit AI Coach that reads continuous bio-data loops to fine-tune your nutrition and exercises automatically.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  id="hero-cta-primary"
                  onClick={handleGetStarted}
                  className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold text-center px-8 py-4 rounded-xl shadow-lg shadow-[#00C853]/25 hover:shadow-[#00C853]/45 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                >
                  Start Your Journey <ArrowRight size={18} />
                </button>
                <a
                  href="#how-it-works"
                  className="border border-white/20 hover:bg-white/5 text-white font-bold text-center px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Watch Demo
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 text-center sm:text-left">
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-[#00C853]">99.4%</h4>
                  <p className="text-xs text-gray-400">AI Plan Accuracy</p>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-[#BFFF00]">10M+</h4>
                  <p className="text-xs text-gray-400">Calories Tracked</p>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-white">24/7</h4>
                  <p className="text-xs text-gray-400">Fitbit Live Support</p>
                </div>
              </div>
            </div>

            {/* Visual Grid representing App Shell Dashboard */}
            <div className="lg:col-span-6 relative w-full h-full min-h-[350px] md:min-h-[450px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[#00C853]/10 blur-3xl rounded-full"></div>
              
              <div className="relative w-full bg-[#1e1e38]/80 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 max-w-md backdrop-blur-lg transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono tracking-wider">HEALTHIFY_UI_v4.2</span>
                </div>

                <div className="space-y-4">
                  {/* Calorie Progress Mock */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-400">DAILY CALORIES</span>
                      <span className="text-[#00C853]">1,840 / 2,200 kcal</span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00C853] to-[#BFFF00] h-full rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>

                  {/* Hydration Mock */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-400">HYDRATION LEVEL</span>
                      <span className="text-cyan-400">1.8L / 2.5L</span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  {/* AI Coach Suggestion Mock */}
                  <div className="bg-[#00C853]/10 p-4 rounded-xl border border-[#00C853]/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00C853] flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#00C853]">AI Performance Insights</h5>
                      <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">
                        "Your calorie surplus is perfect for today's recovery. Perform a 15-minute cool down stretch to log optimal rest metrics."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGetStarted}
                    className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-bold py-2.5 px-5 rounded-lg flex items-center gap-1.5 shadow transition-all"
                  >
                    Enter Live Command Center <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* 6 Feature Cards Grid */}
          <section id="features" className="py-20 px-4 md:px-8 bg-black/25 relative scroll-mt-16">
            <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Designed for Complete <span className="text-[#00C853]">Physical Optimization</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                Discover the feature suite engineered to synchronize health metrics, logs, and professional feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="group bg-[#1e1e35]/50 border border-white/5 rounded-2xl p-6 hover:border-[#00C853]/50 hover:bg-[#1e1e35] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 ${feat.isLime ? 'bg-[#BFFF00]/10 text-[#BFFF00]' : 'bg-[#00C853]/10 text-[#00C853]'}`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">{feat.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="mt-6 flex items-center text-xs font-semibold text-[#00C853] opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4-Step How-It-Works Timeline */}
          <section id="how-it-works" className="py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-16">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Your Road to <span className="text-[#BFFF00]">Transformation</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">
                Four simple steps to integrate smart health engineering into your daily ritual.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-16 left-8 right-8 h-0.5 bg-gradient-to-r from-[#00C853] via-[#BFFF00] to-[#00C853] opacity-20 z-0"></div>

              {STEPS.map((step, idx) => (
                <div key={idx} className="relative bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col space-y-4 z-10 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#BFFF00]">
                      {step.num}
                    </span>
                    <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-mono tracking-wider text-gray-400">Step</span>
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3-Tier Pricing Section */}
          <section id="pricing" className="py-20 px-4 md:px-8 bg-black/20 scroll-mt-16">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Flexible Plans for <span className="text-[#00C853]">Every Goal</span>
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto text-sm">
                  Activate an account instantly and upgrade anytime for advanced AI features.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                {PRICING.map((plan, idx) => (
                  <div
                    key={idx}
                    className={`bg-[#1e1e38]/80 border rounded-3xl p-8 flex flex-col justify-between transition-all relative ${plan.popular ? 'border-[#00C853] shadow-lg shadow-[#00C853]/15 md:scale-[1.03] z-10' : 'border-white/10'}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00C853] to-[#BFFF00] text-black font-black text-[10px] tracking-widest uppercase px-4 py-1 rounded-full shadow">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
                      </div>

                      <div className="flex items-baseline">
                        <span className="text-4xl md:text-5xl font-black">{plan.price}</span>
                        <span className="text-xs text-gray-400 ml-1">/ month</span>
                      </div>

                      <ul className="space-y-3 pt-6 border-t border-white/5 text-sm">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-gray-300">
                            <span className="text-[#00C853] mt-0.5 shrink-0"><Check size={14} /></span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlanAndActivate(plan.name)}
                      className={`w-full py-4.5 rounded-xl font-bold transition-all text-center mt-8 cursor-pointer ${plan.popular ? 'bg-[#00C853] hover:bg-[#00E676] text-white shadow-lg shadow-[#00C853]/25' : 'bg-white/10 hover:bg-white/15 text-white'}`}
                    >
                      {plan.name === 'Free Starter' ? 'Activate Free' : plan.name === 'Pro Athlete' ? 'Go Pro Athlete' : 'Choose Premium Elite'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3 Testimonial Cards */}
          <section id="testimonials" className="py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-16">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Verified Success <span className="text-[#BFFF00]">Stories</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-sm">
                Join thousands who revolutionized their training under the guidance of HealthifyYou.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00C853] to-[#BFFF00] flex items-center justify-center font-bold text-black text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{t.author}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span>{t.tag}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                        <span className="text-[#00C853] font-medium">{t.loss}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-[#00C853]/20 via-[#2D1B4E] to-[#1A1A2E] border border-[#00C853]/30 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C853]/10 rounded-full blur-2xl"></div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Unlock Your Personal Best Evolution Today
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-xs md:text-sm leading-relaxed">
                Unlock daily health recommendations, calorie targets, and responsive fitness metrics matched perfectly with our Fitbit intelligence core.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
              >
                Access Command Center Now <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-black/30 border-t border-white/5 px-4 md:px-8 py-12 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center font-bold text-white text-sm">H</div>
                  <span className="font-bold text-lg">HealthifyYou</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Deep biometric insights, AI scheduling, and real-time habit adjustments designed around your lifestyle.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-300">Application</h4>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li><a href="#features" className="hover:text-white transition-colors">AI Workout Planner</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Calorie Tracker</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Smart Dashboard</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Fitbit Sync</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-300">Resources</h4>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</a></li>
                  <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Technical Docs</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-300">Legal & Privacy</h4>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <span>&copy; {new Date().getFullYear()} HealthifyYou AI. All rights reserved.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-300">Security Audit</a>
                <a href="#" className="hover:text-gray-300">Cookie Preferences</a>
                <a href="#" className="hover:text-gray-300">Support Center</a>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* VIEW: LOGIN SCREEN */}
      {view === 'login' && (
        <div id="view-login" className="flex flex-col justify-center items-center min-h-screen p-4 bg-gradient-to-br from-[#1A1A2E] via-[#2D1B4E] to-[#1A1A2E] relative overflow-hidden">
          {/* Subtle glowing backgrounds */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00C853]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#BFFF00]/10 rounded-full blur-3xl"></div>

          <div className="w-full max-w-md bg-[#1e1e38]/80 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Logo Header */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#00C853] rounded-2xl font-black text-white shadow-xl shadow-[#00C853]/20 text-2xl">
                H
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white mt-3">
                Healthify<span className="text-[#00C853]">You</span>
              </h2>
              <p className="text-sm text-gray-400">Your AI-Powered Health Companion</p>
            </div>

            {/* Authentication Buttons */}
            <div className="space-y-4 pt-4">
              <button
                onClick={() => {
                  setGoogleLoginStage('chooser');
                  setShowGoogleModal(true);
                }}
                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {/* SVG Google icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.93 1 12 1 7.35 1 3.4 3.65 1.51 7.5l3.72 2.89C6.1 7.15 8.83 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.89c2.28-2.1 3.56-5.19 3.56-8.72z" />
                  <path fill="#FBBC05" d="M5.23 10.39c-.24-.71-.38-1.47-.38-2.27s.14-1.56.38-2.27L1.51 2.96C.7 4.57.24 6.38.24 8.28s.46 3.71 1.27 5.32l3.72-2.89z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.47 1.15-4.04 1.15-3.17 0-5.9-2.11-6.77-5.35L1.51 15.8C3.4 19.65 7.35 23 12 23z" />
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={handleGuestLogin}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <User size={18} className="text-gray-400" />
                Continue as Guest
              </button>
            </div>

            <div className="border-t border-white/5 pt-6 text-center">
              <button
                onClick={() => setView('landing')}
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Landing Page
              </button>
            </div>
          </div>

          {/* GOOGLE SIGN-IN SIMULATOR MODAL (Elegant Popup workflow) */}
          {showGoogleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <div className="w-full max-w-sm bg-[#1e1e38] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150">
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>

                {googleLoginStage === 'chooser' && (
                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.89c2.28-2.1 3.56-5.19 3.56-8.72z" />
                          <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.47 1.15-4.04 1.15-3.17 0-5.9-2.11-6.77-5.35L1.51 15.8C3.4 19.65 7.35 23 12 23z" />
                        </svg>
                        Google Accounts
                      </div>
                      <h3 className="text-lg font-black text-white">Choose an Account</h3>
                      <p className="text-xs text-gray-400">to continue to HealthifyYou</p>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => handleGoogleAccountSelect('Alex Johnson', 'alex.johnson@gmail.com')}
                        className="w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                            AJ
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Alex Johnson</p>
                            <p className="text-[10px] text-gray-400">alex.johnson@gmail.com</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                      </button>

                      <button
                        onClick={() => handleGoogleAccountSelect('Sarah Jenkins', 'sarah.j@gmail.com')}
                        className="w-full p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            SJ
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Sarah Jenkins</p>
                            <p className="text-[10px] text-gray-400">sarah.j@gmail.com</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                      </button>

                      <button
                        onClick={() => setGoogleLoginStage('input')}
                        className="w-full p-3.5 border border-dashed border-white/15 hover:border-[#00C853] hover:bg-white/5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Plus size={14} /> Use another account
                      </button>
                    </div>
                  </div>
                )}

                {googleLoginStage === 'input' && (
                  <form onSubmit={handleCustomGoogleSubmit} className="p-6 space-y-5">
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-black text-white">Enter Account Details</h3>
                      <p className="text-xs text-gray-400">Sign in with a virtual Google credential</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={customGoogleName}
                          onChange={(e) => setCustomGoogleName(e.target.value)}
                          placeholder="e.g. Liam Miller"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-[#00C853]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={customGoogleEmail}
                          onChange={(e) => setCustomGoogleEmail(e.target.value)}
                          placeholder="e.g. liam.miller@gmail.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-[#00C853]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setGoogleLoginStage('chooser')}
                        className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-bold text-xs rounded-xl transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                )}

                {googleLoginStage === 'loading' && (
                  <div className="p-8 flex flex-col items-center justify-center space-y-5">
                    <div className="w-12 h-12 border-4 border-[#00C853] border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-white">Connecting Securely...</p>
                      <p className="text-[10px] text-gray-400">Authenticating Google ID Token</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: ONBOARDING WIZARD */}
      {view === 'onboarding' && (
        <div id="view-onboarding" className="flex flex-col justify-center items-center min-h-screen p-4 bg-[#111122] text-white relative overflow-hidden">
          {/* Glowing bubbles */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00C853]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#BFFF00]/10 rounded-full blur-3xl"></div>

          <div className="w-full max-w-2xl bg-[#1e1e38]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl flex flex-col space-y-6">
            
            {/* Header with Title and Steps Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Configure Your Biometrics</h2>
                  <p className="text-xs text-gray-400">Help our AI build your metabolic profile</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#00C853] px-3 py-1 bg-[#00C853]/10 border border-[#00C853]/20 rounded-full">
                  Step {onboardingStep} of 4
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00C853] to-[#BFFF00] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(onboardingStep / 4) * 100}%` }}
                  ></div>
                </div>
                {/* Dots representation for steps */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 pointer-events-none">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                        s <= onboardingStep
                          ? 'bg-[#00C853] border-[#1e1e38] scale-110 shadow-md shadow-[#00C853]/35'
                          : 'bg-gray-700 border-[#1e1e38]'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Label helpers */}
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500 pt-1">
                <span className={onboardingStep === 1 ? 'text-[#00C853]' : ''}>1. Basics</span>
                <span className={onboardingStep === 2 ? 'text-[#00C853]' : ''}>2. Body Metrics</span>
                <span className={onboardingStep === 3 ? 'text-[#00C853]' : ''}>3. Daily Goal</span>
                <span className={onboardingStep === 4 ? 'text-[#00C853]' : ''}>4. Lifestyle</span>
              </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 pt-4 pb-4">
              
              {/* STEP 1: BASICS */}
              {onboardingStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={onboardingName}
                        onChange={(e) => setOnboardingName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-[#00C853] focus:border-[#00C853]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        value={onboardingDob}
                        onChange={(e) => setOnboardingDob(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-[#00C853] focus:border-[#00C853] scheme-dark"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Biological Gender</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Male', 'Female', 'Other'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setOnboardingGender(g)}
                            className={`py-3.5 px-4 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                              onboardingGender === g
                                ? 'bg-[#00C853]/15 border-[#00C853] text-[#00C853]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                        Biological gender parameter optimizes calculations for the standard Mifflin-St Jeor metabolic basal energy distribution curves.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BODY METRICS */}
              {onboardingStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-5">
                    
                    {/* Weight metric input block */}
                    <div className="bg-white/5 border border-white/5 p-4.5 rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-gray-300">Current Weight</label>
                        <div className="bg-black/40 p-0.5 rounded-lg inline-flex">
                          <button
                            type="button"
                            onClick={() => handleToggleWeightUnit('kg')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                              weightUnit === 'kg' ? 'bg-[#00C853] text-black' : 'text-gray-400'
                            }`}
                          >
                            kg
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleWeightUnit('lb')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                              weightUnit === 'lb' ? 'bg-[#00C853] text-black' : 'text-gray-400'
                            }`}
                          >
                            lb
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={weightUnit === 'kg' ? 35 : 75}
                          max={weightUnit === 'kg' ? 160 : 350}
                          value={onboardingWeight}
                          onChange={(e) => setOnboardingWeight(parseInt(e.target.value))}
                          className="flex-1 accent-[#00C853]"
                        />
                        <div className="w-24 shrink-0 bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-black">
                          {onboardingWeight} <span className="text-[10px] text-gray-400 uppercase">{weightUnit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Height metric input block */}
                    <div className="bg-white/5 border border-white/5 p-4.5 rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-gray-300">Height</label>
                        <div className="bg-black/40 p-0.5 rounded-lg inline-flex">
                          <button
                            type="button"
                            onClick={() => handleToggleHeightUnit('cm')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                              heightUnit === 'cm' ? 'bg-[#00C853] text-black' : 'text-gray-400'
                            }`}
                          >
                            cm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleHeightUnit('in')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                              heightUnit === 'in' ? 'bg-[#00C853] text-black' : 'text-gray-400'
                            }`}
                          >
                            in
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={heightUnit === 'cm' ? 100 : 39}
                          max={heightUnit === 'cm' ? 220 : 86}
                          value={onboardingHeight}
                          onChange={(e) => setOnboardingHeight(parseInt(e.target.value))}
                          className="flex-1 accent-[#00C853]"
                        />
                        <div className="w-24 shrink-0 bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-black">
                          {onboardingHeight} <span className="text-[10px] text-gray-400 uppercase">{heightUnit}</span>
                        </div>
                      </div>
                    </div>

                    {/* BMI Real-Time Calculations feedback card */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase text-gray-400">Dynamic BMI Index</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Your calculated Body Mass Index is live-monitored. Standard healthy thresholds target values between 18.5 and 24.9.
                        </p>
                      </div>
                      
                      <div className="text-center shrink-0 bg-black/25 px-4.5 py-3 rounded-xl border border-white/5 min-w-[110px]">
                        <span className="text-2xl font-black text-white">{computedOnboardingBMI}</span>
                        <span className={`block text-[10px] font-bold uppercase border-t border-white/5 mt-1.5 pt-1.5 ${computedOnboardingBMIStatus.color}`}>
                          {computedOnboardingBMIStatus.text}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: DAILY GOAL */}
              {onboardingStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Primary Fitness Goal</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {([
                          { id: 'Lose Weight', label: 'Lose Weight', desc: 'Caloric deficit targeting healthy body fat loss.' },
                          { id: 'Build Muscle', label: 'Build Muscle', desc: 'Slight surplus targeting metabolic hypertrophy.' },
                          { id: 'Stay Fit', label: 'Stay Fit', desc: 'Caloric balance focusing on endurance and tonus.' },
                          { id: 'Improve Endurance', label: 'Improve Endurance', desc: 'Enhanced oxygen thresholds and carbohydrate loads.' },
                          { id: 'Gain Weight', label: 'Gain Weight', desc: 'Clean weight gain utilizing dense macro targets.' }
                        ] as const).map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setOnboardingGoal(g.id)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-center space-y-0.5 ${
                              onboardingGoal === g.id
                                ? 'bg-[#00C853]/15 border-[#00C853] text-[#00C853]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-xs font-bold text-white">{g.label}</span>
                            <span className="text-[10px] text-gray-400 leading-tight">{g.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Target weight (linked to unit of step 2) */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                          Target Weight ({weightUnit})
                        </label>
                        <input
                          type="number"
                          value={onboardingTargetWeight}
                          onChange={(e) => setOnboardingTargetWeight(parseInt(e.target.value) || 0)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-[#00C853] focus:border-[#00C853]"
                        />
                      </div>

                      {/* Timeline weeks */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                          Timeline (Weeks)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={52}
                          value={onboardingTimeline}
                          onChange={(e) => setOnboardingTimeline(parseInt(e.target.value) || 12)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-[#00C853] focus:border-[#00C853]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Active Multiplier (Lifestyle)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {([
                          { id: 'Sedentary', label: 'Sedentary', mul: '1.2x' },
                          { id: 'Lightly Active', label: 'Lightly Active', mul: '1.375x' },
                          { id: 'Moderately Active', label: 'Moderately', mul: '1.55x' },
                          { id: 'Very Active', label: 'Very Active', mul: '1.725x' }
                        ] as const).map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => setOnboardingActivityLevel(act.id)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                              onboardingActivityLevel === act.id
                                ? 'bg-[#00C853]/15 border-[#00C853] text-[#00C853]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-white leading-none">{act.label}</span>
                            <span className="text-[11px] text-[#00C853] font-black">{act.mul}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: LIFESTYLE */}
              {onboardingStep === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Dietary Preferences</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {(['Balanced', 'Vegan', 'Vegetarian', 'Keto', 'Paleo'] as const).map((diet) => (
                          <button
                            key={diet}
                            type="button"
                            onClick={() => setOnboardingDietary(diet)}
                            className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              onboardingDietary === diet
                                ? 'bg-[#00C853]/15 border-[#00C853] text-[#00C853]'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {diet}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                        Allergies (Exclusions)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(['None', 'Peanuts', 'Gluten', 'Dairy', 'Soy', 'Shellfish', 'Eggs', 'Tree Nuts'] as const).map((all) => {
                          const isSelected = onboardingAllergies.includes(all);
                          return (
                            <button
                              key={all}
                              type="button"
                              onClick={() => handleToggleAllergy(all)}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              <span>{all}</span>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 flex justify-between">
                        <span>Daily Water Intake Goal</span>
                        <span className="text-cyan-400 font-bold font-mono">{onboardingWaterGoal} Liters</span>
                      </label>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setOnboardingWaterGoal(w => Math.max(1, parseFloat((w - 0.25).toFixed(2))))}
                          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min={1.0}
                          max={5.0}
                          step={0.25}
                          value={onboardingWaterGoal}
                          onChange={(e) => setOnboardingWaterGoal(parseFloat(e.target.value))}
                          className="flex-1 accent-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => setOnboardingWaterGoal(w => Math.min(5, parseFloat((w + 0.25).toFixed(2))))}
                          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Wizard Controls Footer */}
            <div className="flex items-center justify-between border-t border-white/5 pt-5">
              <button
                type="button"
                onClick={() => {
                  if (onboardingStep === 1) {
                    setView('login');
                  } else {
                    setOnboardingStep(prev => prev - 1);
                  }
                }}
                className="px-5 py-3 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-gray-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onboardingStep === 4) {
                    handleOnboardingComplete();
                  } else {
                    setOnboardingStep(prev => prev + 1);
                  }
                }}
                className="px-6 py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-black text-xs rounded-xl transition-all shadow-lg hover:shadow-[#00C853]/25 cursor-pointer flex items-center gap-1"
              >
                {onboardingStep === 4 ? 'Complete Setup' : 'Continue'} <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2 — APP SHELL */}
      {view === 'app' && (
        <div id="view-app" className="flex flex-col md:flex-row min-h-screen bg-[#F8F9FA] text-[#1A1A2E] animate-in fade-in duration-300">
          
          {/* Left Sidebar Nav (collapses to bottom bar on mobile) */}
          <aside className="w-full md:w-64 bg-[#1A1A2E] text-white flex flex-col md:min-h-screen shrink-0 border-b md:border-b-0 md:border-r border-white/10">
            {/* Header Title (Hidden on mobile bottom bar) */}
            <div className="p-6 hidden md:flex items-center gap-2.5 border-b border-white/10">
              <div className="w-8 h-8 bg-[#00C853] rounded-lg flex items-center justify-center font-bold text-white">H</div>
              <div>
                <span className="font-bold text-lg leading-none block">Healthify<span className="text-[#00C853]">You</span></span>
                <span className="text-[10px] text-[#BFFF00] font-mono tracking-wider">COMMAND CENTER</span>
              </div>
            </div>

            {/* Nav Menu Tabs (Desktop Layout) */}
            <nav className="hidden md:flex flex-1 flex-col px-4 py-6 space-y-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Activity size={18} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('workouts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'workouts' ? 'bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Dumbbell size={18} /> Workouts
              </button>
              <button
                onClick={() => setActiveTab('meals')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'meals' ? 'bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <ChefHat size={18} /> Meals
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'coach' ? 'bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Brain size={18} /> AI Coach
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-[#00C853] text-white shadow-lg shadow-[#00C853]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <User size={18} /> Profile
              </button>
            </nav>

            {/* Profile badge at the bottom of sidebar (hidden on mobile) */}
            <div className="p-4 border-t border-white/10 hidden md:block">
              <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00C853] to-[#BFFF00] flex items-center justify-center font-bold text-black text-sm uppercase">
                  AJ
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{userProfile.name}</p>
                  <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]"></span> {selectedPlan}
                  </p>
                </div>
                <button
                  onClick={() => setView('landing')}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300"
                  title="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
            <div className="md:hidden flex items-center justify-around py-3 px-2 bg-[#1A1A2E] border-t border-white/10 fixed bottom-0 left-0 right-0 z-50 shadow-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-center cursor-pointer ${activeTab === 'dashboard' ? 'text-[#00C853]' : 'text-gray-400'}`}
              >
                <Activity size={20} />
                <span className="text-[9px] font-bold">Dash</span>
              </button>
              <button
                onClick={() => setActiveTab('workouts')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-center cursor-pointer ${activeTab === 'workouts' ? 'text-[#00C853]' : 'text-gray-400'}`}
              >
                <Dumbbell size={20} />
                <span className="text-[9px] font-bold">Workouts</span>
              </button>
              <button
                onClick={() => setActiveTab('meals')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-center cursor-pointer ${activeTab === 'meals' ? 'text-[#00C853]' : 'text-gray-400'}`}
              >
                <ChefHat size={20} />
                <span className="text-[9px] font-bold">Meals</span>
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-center cursor-pointer ${activeTab === 'coach' ? 'text-[#00C853]' : 'text-gray-400'}`}
              >
                <Brain size={20} />
                <span className="text-[9px] font-bold">AI Coach</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-center cursor-pointer ${activeTab === 'profile' ? 'text-[#00C853]' : 'text-gray-400'}`}
              >
                <User size={20} />
                <span className="text-[9px] font-bold">Profile</span>
              </button>
            </div>
          </aside>

          {/* Main App Container */}
          <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-y-auto bg-[#F8F9FA]">
            
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center gap-3">
                {/* Mobile menu logo trigger */}
                <div className="md:hidden w-7 h-7 bg-[#00C853] rounded-lg flex items-center justify-center font-bold text-white text-sm">H</div>
                <h2 id="active-tab-title" className="font-extrabold text-lg md:text-xl capitalize">
                  {activeTab}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {/* Calorie Progress Badge */}
                <span className="hidden sm:inline-flex px-3 py-1 bg-[#00C853]/10 text-[#00C853] font-bold text-xs rounded-full">
                  Today: {caloriesConsumed} / {userProfile.targetCalories} kcal
                </span>
                
                {/* Active Streak */}
                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs bg-orange-500/10 px-2.5 py-1 rounded-full">
                  <Flame size={14} /> {userProfile.streak} Day Streak
                </div>

                <div
                  onClick={() => setActiveTab('profile')}
                  className="w-8 h-8 rounded-full bg-[#00C853] text-black font-extrabold text-xs flex items-center justify-center cursor-pointer select-none border border-gray-200"
                >
                  AJ
                </div>
              </div>
            </header>

            {/* TAB CONTENTS CONTAINER */}
            <div className="flex-1 p-4 md:p-8 space-y-6">

              {/* 1. DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <DashboardTab
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  caloriesConsumed={caloriesConsumed}
                  setCaloriesConsumed={setCaloriesConsumed}
                  hydrationConsumed={hydrationConsumed}
                  setHydrationConsumed={setHydrationConsumed}
                  activeMinutes={activeMinutes}
                  setActiveMinutes={setActiveMinutes}
                  setActiveTab={setActiveTab}
                />
              )}

              {/* 2. WORKOUTS TAB */}
              {activeTab === 'workouts' && (
                <div id="app-workouts" className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-800">HealthifyYou AI Workout Suite</h2>
                      <p className="text-xs text-gray-500">Autonomous training, interval management, and live metabolic counters</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {workoutPlan && (
                        <button
                          onClick={() => setWorkoutSubView(workoutSubView === 'weeklyPlan' ? 'home' : 'weeklyPlan')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={14} className="text-[#00C853]" />
                          {workoutSubView === 'weeklyPlan' ? 'Back to Workouts' : 'View Weekly Plan'}
                        </button>
                      )}
                      <button
                        onClick={() => generateWeeklyPlan(userProfile.goal || 'Stay Fit', userProfile.activityLevel || 'Sedentary')}
                        disabled={workoutPlanStatus === 'generating'}
                        className="bg-[#00C853] hover:bg-[#00E676] disabled:opacity-50 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Brain size={14} />
                        {workoutPlanStatus === 'generating' ? 'Generating Plan...' : 'Generate Weekly Plan'}
                      </button>
                    </div>
                  </div>

                  {/* SUBVIEW 1: WORKOUTS HOME */}
                  {workoutSubView === 'home' && (
                    <div className="space-y-6">
                      
                      {/* Top Highlight Row: AI Suggested Workout & Live Stats Overview */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* AI Suggested Workout Card */}
                        <div className="lg:col-span-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-5 rounded-2xl border border-emerald-500/20 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-widest bg-[#00C853] text-white px-2.5 py-0.5 rounded-full">
                              AI Suggested for {userProfile.goal || 'Fitness'}
                            </span>
                            <span className="text-[10px] font-mono text-[#00C853] font-bold flex items-center gap-1">
                              <Sparkles size={11} /> Ready
                            </span>
                          </div>

                          {(() => {
                            const suggested = getAISuggestedExercise(userProfile.goal || 'Stay Fit');
                            return (
                              <div className="space-y-3">
                                <div>
                                  <h3 className="text-lg font-black text-gray-800">{suggested.name}</h3>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {suggested.desc}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-[11px]">
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                    ⏱️ {suggested.durationOrReps}
                                  </span>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                                    🔥 {suggested.caloriesPerMinute} kcal/min
                                  </span>
                                  <span className="bg-[#00C853]/10 text-[#00C853] px-2 py-1 rounded-md font-bold">
                                    💪 {suggested.difficulty}
                                  </span>
                                </div>

                                <div className="pt-2 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedExercise(suggested);
                                      setWorkoutSubView('detail');
                                    }}
                                    className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-black py-2 px-4 rounded-xl border border-gray-200 transition-all cursor-pointer flex-1 text-center"
                                  >
                                    Review Form & Guide
                                  </button>
                                  <button
                                    onClick={() => handleStartWorkoutSession(suggested)}
                                    className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-black py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex-1 text-center"
                                  >
                                    Start Exercise Now
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Weekly Metrics & Activity Tracker */}
                        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                            <TrendingUp size={16} className="text-[#00C853]" />
                            Weekly MetCon Chart (7 Days)
                          </h3>

                          {/* Simplified Responsive CSS Chart */}
                          <div className="flex items-end justify-between h-28 pt-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                              // Dynamically calculate calorie total for each day representation based on history
                              let burnAmount = 0;
                              if (idx === 0) burnAmount = 180; // Preset history equivalents
                              if (idx === 1) burnAmount = 240;
                              if (idx === 2) burnAmount = 110;
                              
                              // Check if current user logged any workout with this weekday prefix
                              const weekdayMatches = workoutHistory.filter(h => h.date.includes(day));
                              if (weekdayMatches.length > 0) {
                                burnAmount += weekdayMatches.reduce((acc, curr) => acc + curr.calories, 0);
                              }

                              const maxBurn = 400;
                              const heightPct = Math.min(100, Math.max(10, (burnAmount / maxBurn) * 100));

                              return (
                                <div key={day} className="flex flex-col items-center flex-1 gap-1">
                                  <span className="text-[9px] font-mono font-bold text-gray-400">{burnAmount}k</span>
                                  <div className="w-6 bg-gray-100 rounded-md overflow-hidden h-16 flex items-end">
                                    <div 
                                      style={{ height: `${heightPct}%` }}
                                      className="w-full bg-gradient-to-t from-[#00C853] to-[#BFFF00] transition-all duration-500 rounded-b-md"
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500">{day}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">This Week</p>
                              <p className="text-sm font-black text-gray-800">
                                {workoutHistory.reduce((acc, curr) => acc + curr.calories, 0)} kcal
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Workouts Done</p>
                              <p className="text-sm font-black text-gray-800">{workoutHistory.length}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Avg Intensity</p>
                              <p className="text-sm font-black text-gray-800">High</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Manual Exercise Library Block */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        
                        {/* Search & Category Filter Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-1.5">
                              <Dumbbell size={18} className="text-[#00C853]" />
                              Movement Directory & Form Guides
                            </h3>
                            <p className="text-xs text-gray-400">Filter exercises by discipline, search form tips or view step-by-step guides</p>
                          </div>

                          <div className="relative w-full sm:w-64 shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
                            <input
                              type="text"
                              placeholder="Search exercises..."
                              value={workoutSearch}
                              onChange={(e) => setWorkoutSearch(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-[#00C853] transition-all"
                            />
                          </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap gap-2 pb-1">
                          {WORKOUT_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setWorkoutFilter(cat)}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${workoutFilter === cat ? 'bg-[#00C853] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Exercises Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
                          {filteredExercises.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 text-xs">
                              No matching exercises found. Try refining your keyword filter!
                            </div>
                          ) : (
                            filteredExercises.map((ex) => (
                              <div 
                                key={ex.id} 
                                onClick={() => {
                                  setSelectedExercise(ex);
                                  setWorkoutSubView('detail');
                                }}
                                className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-300 p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer group"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 bg-[#00C853]/10 text-[#00C853] font-bold text-[9px] uppercase tracking-wide rounded-md">
                                      {ex.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-400 font-medium">
                                      {ex.difficulty}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-extrabold text-gray-800 group-hover:text-[#00C853] transition-colors">
                                    {ex.name}
                                  </h4>
                                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                                    {ex.desc}
                                  </p>
                                </div>

                                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                  <span>🔥 {ex.caloriesPerMinute} kcal/min</span>
                                  <span className="text-[#00C853] font-bold flex items-center gap-0.5 hover:underline">
                                    View Details <ChevronRight size={12} />
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                      </div>

                      {/* Workout History Logs */}
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                            <Calendar size={16} className="text-[#00C853]" />
                            Historic Activity Log
                          </h3>
                          <span className="text-xs font-bold text-gray-400">Streak: {userProfile.streak || 3} days</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {workoutHistory.map((hist, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl flex items-center justify-between hover:shadow-sm transition-all">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-gray-800 truncate">{hist.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {hist.date} &bull; {hist.duration} mins &bull; {hist.category || 'Fitness'}
                                </p>
                                {hist.stars && (
                                  <div className="flex items-center gap-0.5 mt-1 text-amber-400 text-[10px]">
                                    {Array.from({ length: hist.stars }).map((_, i) => <span key={i}>★</span>)}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-black text-[#00C853] shrink-0 bg-[#00C853]/10 px-2 py-1 rounded-lg">
                                -{hist.calories} kcal
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SUBVIEW 2: EXERCISE DETAIL VIEW */}
                  {workoutSubView === 'detail' && selectedExercise && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
                      
                      {/* Back Link */}
                      <button
                        onClick={() => {
                          setSelectedExercise(null);
                          setWorkoutSubView('home');
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <ArrowLeft size={14} /> Back to Move Directory
                      </button>

                      {/* Detail Body */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Column 1: Animated CSS Illustration */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 p-8 min-h-[320px]">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-6 font-bold">
                            Animated CSS Execution Form
                          </span>

                          <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Inner ambient visualizer matching category */}
                            {selectedExercise.category === 'Strength' && (
                              <div className="w-24 h-6 bg-gradient-to-r from-[#00C853] to-[#BFFF00] rounded-full animate-pushup shadow-lg shadow-emerald-500/25 flex items-center justify-center">
                                <span className="w-4 h-4 bg-white rounded-full"></span>
                              </div>
                            )}

                            {selectedExercise.category === 'Yoga' && (
                              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-[#00C853]/30 rounded-full animate-yoga-pulse border border-emerald-500 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/40 rounded-full animate-pulse"></div>
                              </div>
                            )}

                            {selectedExercise.category === 'Cardio' && (
                              <div className="flex gap-1.5 items-end h-20 animate-cardio">
                                <div className="w-3 h-12 bg-[#00C853] rounded-full"></div>
                                <div className="w-3 h-20 bg-[#BFFF00] rounded-full"></div>
                                <div className="w-3 h-16 bg-[#00C853] rounded-full"></div>
                              </div>
                            )}

                            {selectedExercise.category === 'HIIT' && (
                              <div className="w-20 h-20 bg-gradient-to-t from-red-500 via-[#00C853] to-[#BFFF00] rounded-2xl animate-hiit-flame flex items-center justify-center">
                                <span className="font-black text-white text-xs">HI-OCT</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 text-center">
                            <span className="text-[11px] font-bold text-[#00C853] bg-[#00C853]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                              {selectedExercise.category} Engine Active
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Specific Training Data */}
                        <div className="lg:col-span-7 space-y-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white bg-[#00C853] px-2.5 py-0.5 rounded-md uppercase">
                                {selectedExercise.difficulty}
                              </span>
                              <span className="text-xs text-gray-400 font-semibold">{selectedExercise.category} Category</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mt-2">{selectedExercise.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {selectedExercise.desc}
                            </p>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl text-center">
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-black">Calories Burned</p>
                              <p className="text-sm font-bold text-[#00C853]">{selectedExercise.caloriesPerMinute} kcal/min</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-black">Target Regime</p>
                              <p className="text-sm font-bold text-gray-700">{selectedExercise.durationOrReps}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-black">Target Muscles</p>
                              <p className="text-sm font-bold text-gray-700 truncate">{selectedExercise.targetMuscles ? selectedExercise.targetMuscles[0] : selectedExercise.muscle}</p>
                            </div>
                          </div>

                          {/* Target Muscles Badges */}
                          {selectedExercise.targetMuscles && (
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Target Muscles Involved</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedExercise.targetMuscles.map((m: string) => (
                                  <span key={m} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Instructions List */}
                          {selectedExercise.instructions && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Execution Guide</h4>
                              <ul className="space-y-2 text-xs text-gray-600">
                                {selectedExercise.instructions.map((step: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 shrink-0 bg-gray-100 text-[#00C853] font-bold rounded-full flex items-center justify-center text-[10px]">
                                      {i + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Form Tips */}
                          {selectedExercise.formTips && (
                            <div className="space-y-1.5 bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl">
                              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1">
                                💡 Vital Form Tips & Safeguards
                              </h4>
                              <ul className="list-disc list-inside text-[11px] text-amber-700 space-y-1 leading-relaxed">
                                {selectedExercise.formTips.map((tip: string, i: number) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-4 flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedExercise(null);
                                setWorkoutSubView('home');
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black py-3 px-6 rounded-xl transition-all cursor-pointer text-center"
                            >
                              Back to Directory
                            </button>
                            <button
                              onClick={() => handleStartWorkoutSession(selectedExercise)}
                              className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-black py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer flex-1 text-center"
                            >
                              Launch Training Interval & Timer
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* SUBVIEW 3: WORKOUT SESSION SCREEN */}
                  {workoutSubView === 'session' && activeSession && (
                    <div className="bg-[#1A1A2E] text-white p-6 rounded-2xl border border-white/10 shadow-xl space-y-6 animate-in zoom-in-95 duration-200 max-w-2xl mx-auto">
                      
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-[10px] uppercase bg-[#00C853] text-white font-black px-2.5 py-0.5 rounded-full">
                            Active Session State
                          </span>
                          <h3 className="text-lg font-black mt-1 text-white">{activeSession.exercise.name}</h3>
                        </div>
                        <span className="text-xs font-mono text-gray-400">
                          Set {activeSession.setCount} of {activeSession.totalSets}
                        </span>
                      </div>

                      {/* Rest Overlay or Main Countdown Timer */}
                      {activeSession.restTimeRemaining > 0 ? (
                        <div className="bg-emerald-950/40 border border-emerald-500/20 p-8 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
                          <span className="text-xs font-black uppercase text-emerald-400 tracking-widest block">Rest Period</span>
                          <div className="text-5xl font-mono font-black text-[#00C853]">
                            {activeSession.restTimeRemaining}s
                          </div>
                          <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                            Hydrate and relax. Prepare for Set {activeSession.setCount + 1} of {activeSession.totalSets}.
                          </p>
                          <button
                            onClick={() => {
                              setActiveSession((prev: any) => ({
                                ...prev,
                                restTimeRemaining: 0,
                                setCount: prev.setCount + 1,
                                timeRemaining: prev.initialTime
                              }));
                            }}
                            className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer inline-block"
                          >
                            Skip Rest Interval
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          
                          {/* Giant Circular Countdown or Rep Counter */}
                          <div className="flex flex-col items-center justify-center py-6">
                            
                            {activeSession.isTimed ? (
                              <div className="relative w-44 h-44 rounded-full border-4 border-white/10 flex flex-col items-center justify-center bg-white/5 shadow-inner">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Time Remaining</span>
                                <div className="text-3xl font-mono font-black text-white mt-1.5">
                                  {Math.floor(activeSession.timeRemaining / 60)}:{(activeSession.timeRemaining % 60).toString().padStart(2, '0')}
                                </div>
                                <span className="text-[9px] text-[#00C853] font-bold mt-1">
                                  Set {activeSession.setCount} Running
                                </span>
                              </div>
                            ) : (
                              <div className="relative w-44 h-44 rounded-full border-4 border-[#00C853]/40 flex flex-col items-center justify-center bg-white/5 shadow-inner">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Target Volume</span>
                                <div className="text-2xl font-black text-white mt-1.5">
                                  {activeSession.exercise.durationOrReps}
                                </div>
                                <button
                                  onClick={handleCompleteSet}
                                  className="mt-3 bg-[#00C853] hover:bg-[#00E676] text-white text-[10px] font-black uppercase py-1.5 px-3.5 rounded-lg transition-all cursor-pointer"
                                >
                                  Complete Set Done
                                </button>
                              </div>
                            )}

                          </div>

                          {/* Heart Rate / Intensity Pulse Indicator */}
                          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                                <Heart className="text-red-500 fill-red-500" size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-black text-gray-400">Cardio Intensity</p>
                                <p className="text-xs text-white font-bold">122 BPM (Continuous)</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-black text-gray-400">Calories Burned</p>
                              <p className="text-xs font-mono font-black text-[#00C853]">{activeSession.sessionCalories} kcal</p>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Controls Area */}
                      <div className="pt-4 border-t border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveSession((prev: any) => ({
                                ...prev,
                                isPaused: !prev.isPaused
                              }));
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-black py-3 px-6 rounded-xl transition-all cursor-pointer flex-1 text-center"
                          >
                            {activeSession.isPaused ? 'Resume Session' : 'Pause Workout'}
                          </button>
                          
                          {/* Force Finish Button */}
                          <button
                            onClick={() => {
                              // Trigger showing rating modal before saving
                              setActiveSession((prev: any) => ({ ...prev, isPaused: true, isFinishing: true }));
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3 px-6 rounded-xl transition-all cursor-pointer flex-1 text-center"
                          >
                            Finish & Save
                          </button>
                        </div>
                      </div>

                      {/* Post-Workout Rating Panel (Modal state inside session) */}
                      {activeSession.isFinishing && (
                        <div className="bg-[#2D1B4E] border border-white/25 p-5 rounded-xl space-y-4 animate-in fade-in duration-300">
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                            <Award size={18} className="text-[#00C853]" />
                            Rate Training Effort Output
                          </h4>
                          <p className="text-xs text-gray-300">
                            Excellent work! How would you rate your muscle feedback and metabolic intensity today?
                          </p>

                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setSessionRating(star)}
                                className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${sessionRating >= star ? 'text-amber-400' : 'text-gray-500'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => {
                                setActiveSession((prev: any) => ({ ...prev, isFinishing: false }));
                              }}
                              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg flex-1 cursor-pointer"
                            >
                              Keep Training
                            </button>
                            <button
                              onClick={() => handleFinishWorkoutSession(sessionRating)}
                              className="bg-[#00C853] hover:bg-[#00E676] text-white text-xs font-black py-2 px-4 rounded-lg flex-1 cursor-pointer"
                            >
                              Log & Save to History
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* SUBVIEW 4: AI WORKOUT PLAN GENERATOR (WEEKLY CALENDAR VIEW) */}
                  {workoutSubView === 'weeklyPlan' && workoutPlan && (
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-200">
                      
                      {/* Back button */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setWorkoutSubView('home')}
                          className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <ArrowLeft size={14} /> Back to Move Directory
                        </button>
                        <span className="text-[10px] font-mono bg-[#00C853]/15 text-[#00C853] px-2 py-0.5 rounded uppercase font-bold">
                          7-Day Dynamic Cycle
                        </span>
                      </div>

                      {/* Calendar Layout */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-black text-gray-800">Your AI-Generated Dynamic Routine</h3>
                          <p className="text-xs text-gray-500">Optimized for goal: <strong className="text-[#00C853]">{userProfile.goal || 'Stay Fit'}</strong></p>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                          {workoutPlan.map((day: any, i: number) => {
                            const isToday = i === 1; // dummy day reference
                            const isExpanded = expandedPlanDay === i;

                            return (
                              <div
                                key={day.dayName}
                                className={`p-4 rounded-xl border transition-all ${day.isRestDay ? 'bg-gray-50/70 border-gray-100' : 'bg-white border-emerald-500/20 shadow-sm'} ${isToday ? 'ring-2 ring-[#00C853]' : ''}`}
                              >
                                <div className="flex flex-col h-full justify-between gap-3">
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-black text-gray-800">{day.dayName}</span>
                                      {isToday && (
                                        <span className="text-[8px] bg-[#00C853] text-white px-1.5 py-0.5 rounded font-black uppercase">
                                          Today
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`text-[11px] font-bold mt-1.5 leading-snug ${day.isRestDay ? 'text-gray-500' : 'text-[#00C853]'}`}>
                                      {day.title}
                                    </h4>
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => setExpandedPlanDay(isExpanded ? null : i)}
                                      className="w-full text-left text-[10px] font-bold text-gray-400 hover:text-gray-700 flex items-center justify-between"
                                    >
                                      <span>{day.exercises.length} Movements</span>
                                      <span>{isExpanded ? '▲' : '▼'}</span>
                                    </button>

                                    {isExpanded && (
                                      <div className="space-y-1 pt-1.5 max-h-[120px] overflow-y-auto">
                                        {day.exercises.map((ex: any) => (
                                          <div
                                            key={ex.id}
                                            onClick={() => {
                                              setSelectedExercise(ex);
                                              setWorkoutSubView('detail');
                                            }}
                                            className="text-[10px] text-gray-600 bg-gray-50 hover:bg-gray-100 p-1 rounded font-medium cursor-pointer truncate"
                                          >
                                            {ex.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {!day.isRestDay ? (
                                    <button
                                      onClick={() => handleStartWorkoutSession(day.exercises[0])}
                                      className="w-full bg-[#00C853] hover:bg-[#00E676] text-white text-[10px] font-black py-1.5 rounded-lg text-center transition-all cursor-pointer"
                                    >
                                      Start Day's Training
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStartWorkoutSession(day.exercises[0])}
                                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00C853] text-[10px] font-black py-1.5 rounded-lg text-center transition-all cursor-pointer"
                                    >
                                      Begin Gentle Yoga Flow
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* 3. MEALS TAB */}
              {activeTab === 'meals' && (
                <MealsTab
                  userProfile={userProfile}
                  setCaloriesConsumed={setCaloriesConsumed}
                  setHydrationConsumed={setHydrationConsumed}
                />
              )}

              {/* 4. AI COACH TAB */}
              {activeTab === 'coach' && (
                <CoachTab 
                  userProfile={userProfile} 
                  setActiveTab={setActiveTab} 
                />
              )}

              {/* 5. PROFILE TAB */}
              {activeTab === 'profile' && (
                <div id="app-profile" className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-800">Your Fitness Identity</h2>
                    <p className="text-xs text-gray-500">Edit biometric metrics and manage continuous credentials</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* User Profile Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center space-y-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00C853] to-[#BFFF00] flex items-center justify-center font-black text-black text-2xl uppercase shadow-lg">
                          AJ
                        </div>
                        <span className="absolute bottom-1 right-1 w-5.5 h-5.5 bg-[#00C853] text-white border-2 border-white rounded-full flex items-center justify-center">
                          <CheckCircle size={12} strokeWidth={3} />
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-gray-800">{userProfile.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{userProfile.email}</p>
                        <span className="inline-block px-3 py-1 bg-[#00C853]/10 text-[#00C853] font-bold text-[10px] uppercase rounded-full tracking-wide mt-2">
                          {selectedPlan} Plan
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 w-full">
                        <div className="bg-gray-50 p-3.5 rounded-xl text-center border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current BMI</p>
                          <p className="text-xl font-black text-gray-800 mt-1">{bmiValue}</p>
                          <span className={`text-[10px] font-semibold mt-1 block ${bmiStatus.color}`}>
                            {bmiStatus.text}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-xl text-center border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Fitbit Streak</p>
                          <p className="text-xl font-black text-gray-800 mt-1">{userProfile.streak} days</p>
                          <span className="text-[10px] text-orange-500 font-semibold mt-1 block">Active Burn</span>
                        </div>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="w-full py-3.5 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut size={14} /> Sign Out of Platform
                      </button>
                    </div>

                    {/* Interactive Biometrics form & Gemini Configuration */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                          <h3 className="font-extrabold text-base text-gray-800">Biometric Calibrations</h3>
                          <p className="text-xs text-gray-400">Updating height/weight dynamically triggers recalculations of daily metabolic limits.</p>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Full Name</label>
                              <input
                                type="text"
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-800 focus:outline-[#00C853]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Email Address</label>
                              <input
                                type="email"
                                value={userProfile.email}
                                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-800 focus:outline-[#00C853]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Height (cm)</label>
                              <input
                                type="number"
                                value={userProfile.height}
                                onChange={(e) => setUserProfile({ ...userProfile, height: parseInt(e.target.value) || 0 })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-800 focus:outline-[#00C853]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Weight (kg)</label>
                              <input
                                type="number"
                                value={userProfile.weight}
                                onChange={(e) => setUserProfile({ ...userProfile, weight: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-800 focus:outline-[#00C853]"
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/80 flex items-start gap-3">
                            <span className="text-[#00C853] mt-0.5"><Info size={16} /></span>
                            <div className="text-[11px] text-gray-500 leading-relaxed">
                              <strong className="text-gray-700">Dynamic Calculation logic:</strong> Given your weight ({userProfile.weight} kg) and height ({userProfile.height} cm), your active basal metabolic weight index equals <strong className="text-gray-700">{bmiValue} ({bmiStatus.text})</strong>. Your target intake budget is auto-generated based on the updated metabolic parameters.
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="bg-[#00C853] hover:bg-[#00E676] text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
                            >
                              Save Biometrics & Recalibrate Targets
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Gemini API Settings Card */}
                      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-4">
                        <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                          <Sparkles size={18} className="text-[#00C853]" />
                          <div>
                            <h3 className="font-extrabold text-base text-gray-800">Gemini API Settings</h3>
                            <p className="text-xs text-gray-400">Add your Gemini API key to enable professional AI health coaching.</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Gemini API Key</label>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <input
                                type="password"
                                placeholder="AIzaSy..."
                                value={geminiApiKey}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGeminiApiKey(val);
                                  localStorage.setItem('geminiApiKey', val);
                                }}
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-gray-800 focus:outline-[#00C853]"
                              />
                              <button
                                type="button"
                                disabled={!geminiApiKey.trim() || testingKey}
                                onClick={handleTestConnection}
                                className="bg-[#00C853] hover:bg-[#00E676] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                              >
                                {testingKey ? 'Testing...' : 'Test Connection'}
                              </button>
                            </div>
                          </div>

                          {testStatus && (
                            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                              testStatus.type === 'success' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              <span className={testStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                                {testStatus.type === 'success' ? '✓' : '✗'}
                              </span>
                              <span>{testStatus.message}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

    </div>
  );
}
