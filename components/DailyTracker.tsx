
import React, { useState } from 'react';
import { MealType, FoodEntry, ExerciseEntry, DailyLog } from '../types';
import { analyzeNutrition } from '../geminiService';
import { PRESET_EXERCISES } from '../constants';
import { Coffee, Utensils, Moon, CheckCircle2, Plus, Loader2, Sparkles, Activity, Trash2, X, PlusCircle } from 'lucide-react';

interface DailyTrackerProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ log, onUpdateLog }) => {
  const [loading, setLoading] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');

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

  const deleteMeal = (id: string) => {
    onUpdateLog({ ...log, meals: log.meals.filter(m => m.id !== id) });
  };

  const deleteExercise = (id: string) => {
    onUpdateLog({ ...log, exercises: log.exercises.filter(e => e.id !== id) });
  };

  const addExercise = (name: string) => {
    if (!name.trim()) return;
    const newEx: ExerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
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

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Food Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Utensils className="text-amber-500" /> 식단 기록
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedMeal(type)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedMeal === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
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
              placeholder="음식 이름과 양 (예: 사과 1개)"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFood()}
            />
            <Sparkles className="absolute right-3 top-3.5 text-indigo-400" size={18} />
          </div>
          <button 
            disabled={loading}
            onClick={handleAddFood}
            className="bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          </button>
        </div>

        <div className="space-y-2">
          {log.meals.filter(m => m.type === selectedMeal).map(meal => (
            <div key={meal.id} className="group bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{meal.name}</span>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                  {meal.calories} kcal
                </span>
              </div>
              <button onClick={() => deleteMeal(meal.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
          ))}
          {log.meals.filter(m => m.type === selectedMeal).length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">등록된 식단이 없습니다.</p>
          )}
        </div>
      </section>

      {/* Skincare Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-blue-500" /> 피부 관리 루틴
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(['morning', 'evening'] as const).map(period => (
            <button
              key={period}
              onClick={() => onUpdateLog({...log, skincare: {...log.skincare, [period]: !log.skincare[period]}})}
              className={`p-4 rounded-2xl border transition-all text-left space-y-3 active:scale-95 ${
                log.skincare[period] ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`p-2 rounded-lg ${log.skincare[period] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {period === 'morning' ? <Coffee size={18} /> : <Moon size={18} />}
                </span>
                {log.skincare[period] && <CheckCircle2 className="text-indigo-600" size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold">{period === 'morning' ? '아침 루틴' : '저녁 루틴'}</p>
                <p className="text-[10px] text-slate-500">
                  {period === 'morning' ? '세안+머리감기' : '샤워+세안+머리감기'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Exercise Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity size={20} className="text-green-500" /> 맞춤 운동 기록
        </h2>
        
        {/* Manual Exercise Input */}
        <div className="flex gap-2">
          <input 
            value={customExercise}
            onChange={(e) => setCustomExercise(e.target.value)}
            placeholder="목록에 없는 운동 직접 입력"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && addExercise(customExercise)}
          />
          <button 
            onClick={() => addExercise(customExercise)}
            className="bg-green-600 text-white p-2.5 rounded-xl shadow-sm active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Preset Horizontal Scroll */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-2 px-2 scroll-smooth">
          {PRESET_EXERCISES.map(ex => (
            <button
              key={ex.name}
              onClick={() => addExercise(ex.name)}
              className="flex-shrink-0 whitespace-nowrap bg-white border border-slate-200 px-4 py-2 rounded-full text-[11px] font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
            >
              {ex.name}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {log.exercises.map(ex => (
            <div key={ex.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PlusCircle size={14} className="text-indigo-400" /> {ex.name}
                </p>
                <button onClick={() => deleteExercise(ex.id)} className="text-slate-300 hover:text-rose-500 p-2 -mr-2 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">분</label>
                  <input 
                    type="number" 
                    value={ex.durationMinutes}
                    onChange={(e) => updateExercise(ex.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 rounded-lg p-2 text-sm font-bold outline-none border border-transparent focus:border-indigo-300"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">세트</label>
                  <input 
                    type="number" 
                    value={ex.sets || 0}
                    onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 rounded-lg p-2 text-sm font-bold outline-none border border-transparent focus:border-indigo-300"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">횟수</label>
                  <input 
                    type="number" 
                    value={ex.reps || 0}
                    onChange={(e) => updateExercise(ex.id, { reps: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 rounded-lg p-2 text-sm font-bold outline-none border border-transparent focus:border-indigo-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DailyTracker;
