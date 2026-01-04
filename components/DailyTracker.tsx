import React, { useState } from 'react';
import { MealType, FoodEntry, ExerciseEntry, DailyLog } from '../types';
import { analyzeNutrition } from '../geminiService';
import { PRESET_EXERCISES } from '../constants';
import { Coffee, Utensils, Moon, CheckCircle2, Plus, Loader2, Sparkles, Activity, Trash2, X, PlusCircle, Scale, Pencil, Check, Droplets } from 'lucide-react';

interface DailyTrackerProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ log, onUpdateLog }) => {
  const [loading, setLoading] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [weightInput, setWeightInput] = useState(log.weight.toString());

  const handleAddFood = async () => {
    if (!foodInput) return;
    setLoading(true);
    try {
      const analysis = await analyzeNutrition(foodInput);
      const newEntry: FoodEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedMeal,
        name: analysis.name || foodInput,
        calories: analysis.calories || 0
      };
      onUpdateLog({ ...log, meals: [...log.meals, newEntry] });
      setFoodInput('');
    } catch (e) {
      alert("분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (name: string, isCustom = false) => {
    if (!name.trim()) return;
    const newEx: ExerciseEntry = {
      id: (isCustom ? 'custom-' : 'preset-') + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      durationMinutes: 10,
      reps: 15,
      sets: 3
    };
    onUpdateLog({ ...log, exercises: [...log.exercises, newEx] });
    setCustomExercise('');
  };

  const updateExercise = (id: string, updates: Partial<ExerciseEntry>) => {
    const newExs = log.exercises.map(e => e.id === id ? { ...e, ...updates } : e);
    onUpdateLog({ ...log, exercises: newExs });
  };

  const handleWeightBlur = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      onUpdateLog({...log, weight: val});
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Essential Metrics: Weight & Sleep */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scale className="text-indigo-500" /> 오늘 신체 데이터
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">현재 체중 (kg)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                step="0.01"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onBlur={handleWeightBlur}
                className="w-full text-xl font-bold bg-slate-50 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-300"
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">수면 시간 (시간)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={log.sleepHours}
                onChange={(e) => onUpdateLog({...log, sleepHours: parseInt(e.target.value) || 0})}
                className="w-full text-xl font-bold bg-slate-50 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Food Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Utensils className="text-amber-500" /> 식단 기록
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedMeal(type)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${selectedMeal === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              {type === 'breakfast' ? '아침' : type === 'lunch' ? '점심' : type === 'dinner' ? '저녁' : '간식'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="음식명과 양 입력"
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-10 shadow-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFood()}
            />
            <Sparkles className="absolute right-3 top-3.5 text-indigo-400" size={18} />
          </div>
          <button 
            disabled={loading}
            onClick={handleAddFood}
            className="bg-indigo-600 text-white p-3 rounded-2xl disabled:opacity-50 active:scale-95 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          </button>
        </div>
        <div className="space-y-2">
          {log.meals.filter(m => m.type === selectedMeal).map(meal => (
            <div key={meal.id} className="bg-white p-4 rounded-2xl border border-slate-50 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700">{meal.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {meal.calories} kcal
                </span>
              </div>
              <button onClick={() => onUpdateLog({ ...log, meals: log.meals.filter(m => m.id !== meal.id) })} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Exercise Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-green-500" /> 운동 기록
        </h2>
        
        {/* Preset Selection */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 -mx-6 px-6">
          {PRESET_EXERCISES.map(ex => (
            <button
              key={ex.name}
              onClick={() => addExercise(ex.name)}
              className="flex-shrink-0 whitespace-nowrap bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-full text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              + {ex.name}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input 
            value={customExercise}
            onChange={(e) => setCustomExercise(e.target.value)}
            placeholder="직접 운동 이름 입력..."
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
            onKeyPress={(e) => e.key === 'Enter' && addExercise(customExercise, true)}
          />
          <button 
            onClick={() => addExercise(customExercise, true)}
            className="bg-green-600 text-white p-2.5 rounded-2xl shadow-md active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Logged Exercises List */}
        <div className="space-y-4 pt-2">
          {log.exercises.map(ex => (
            <div key={ex.id} className={`p-5 rounded-3xl border shadow-sm space-y-4 relative ${ex.id.startsWith('custom') ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ex.id.startsWith('custom') ? 'bg-emerald-200 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {ex.id.startsWith('custom') ? '커스텀' : '프리셋'}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{ex.name}</p>
                </div>
                <button onClick={() => onUpdateLog({ ...log, exercises: log.exercises.filter(e => e.id !== ex.id) })} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block text-center">시간(분)</label>
                  <input 
                    type="number" 
                    value={ex.durationMinutes}
                    onChange={(e) => updateExercise(ex.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white rounded-xl p-2 text-sm font-bold text-center outline-none border border-slate-100 focus:border-indigo-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block text-center">세트</label>
                  <input 
                    type="number" 
                    value={ex.sets || 0}
                    onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white rounded-xl p-2 text-sm font-bold text-center outline-none border border-slate-100 focus:border-indigo-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block text-center">횟수</label>
                  <input 
                    type="number" 
                    value={ex.reps || 0}
                    onChange={(e) => updateExercise(ex.id, { reps: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white rounded-xl p-2 text-sm font-bold text-center outline-none border border-slate-100 focus:border-indigo-300"
                  />
                </div>
              </div>
            </div>
          ))}
          {log.exercises.length === 0 && (
            <div className="text-center py-10 text-slate-300 text-xs bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              운동 기록이 없습니다
            </div>
          )}
        </div>
      </section>

      {/* Skincare Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-blue-500" /> 데일리 루틴
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(['morning', 'evening'] as const).map(period => (
            <button
              key={period}
              onClick={() => onUpdateLog({...log, skincare: {...log.skincare, [period]: !log.skincare[period]}})}
              className={`p-5 rounded-3xl border transition-all text-left space-y-3 ${
                log.skincare[period] ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                {period === 'morning' ? <Coffee size={20} /> : <Moon size={20} />}
                {log.skincare[period] && <Check size={16} />}
              </div>
              <div>
                <p className="text-sm font-bold">{period === 'morning' ? '아침 루틴' : '저녁 루틴'}</p>
                <p className={`text-[10px] ${log.skincare[period] ? 'opacity-70' : 'text-slate-400'}`}>
                  {period === 'morning' ? '세안/머리' : '샤워/세안'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mounjaro Quick Dose */}
      <section className="pb-10">
        <button
          onClick={() => onUpdateLog({...log, mounjaroDose: !log.mounjaroDose})}
          className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${
            log.mounjaroDose ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <Droplets className={log.mounjaroDose ? 'text-indigo-600' : 'text-slate-300'} />
            <span className="font-bold">오늘 마운자로 투여함</span>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${log.mounjaroDose ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
            {log.mounjaroDose && <Check size={14} />}
          </div>
        </button>
      </section>
    </div>
  );
};

export default DailyTracker;