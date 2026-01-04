
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog } from '../types';
import { TrendingDown, Moon, Flame, Droplets, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  history: DailyLog[];
  onWeightChange: (weight: number) => void;
  onQuickLog: (type: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, history, onWeightChange, onQuickLog }) => {
  const [weightInput, setWeightInput] = useState(dailyLog.weight.toFixed(2));
  const [chartRange, setChartRange] = useState<'2w' | '4w'>('2w');

  // Keep input in sync with state changes if necessary
  useEffect(() => {
    setWeightInput(dailyLog.weight.toFixed(2));
  }, [dailyLog.weight]);

  const bmi = profile.currentWeight / ((profile.height / 100) ** 2);
  const getBmiStatus = (val: number) => {
    if (val < 18.5) return '저체중';
    if (val < 23) return '정상';
    if (val < 25) return '과체중';
    return '비만';
  };

  const chartData = history.slice(chartRange === '2w' ? -14 : -28).map(log => ({
    date: log.date.split('-')[2],
    weight: parseFloat(log.weight.toFixed(2))
  }));

  const totalCalories = dailyLog.meals.reduce((sum, meal) => sum + meal.calories, 0);

  const handleWeightSave = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      onWeightChange(parseFloat(val.toFixed(2)));
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          안녕하세요, <span className="text-indigo-600">{profile.name}</span>님!
        </h1>
        <p className="text-slate-500 text-sm">오늘도 건강한 하루를 만들어봐요.</p>
      </header>

      {/* Mounjaro Status */}
      {profile.mounjaroActive && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">마운자로(Tirzepatide) 관리 중</p>
              <p className="text-xs text-indigo-600">체중 감소 가속화 단계</p>
            </div>
          </div>
          <button onClick={() => onQuickLog('mounjaro')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${dailyLog.mounjaroDose ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-indigo-600 border border-indigo-200'}`}>
            {dailyLog.mounjaroDose ? '투여완료' : '투여기록'}
          </button>
        </div>
      )}

      {/* Main Metrics Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-rose-500">
            <Flame size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">섭취 칼로리</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{totalCalories}</span>
            <span className="text-slate-400 text-xs font-medium">kcal</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-500">
            <Moon size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">수면 시간</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{dailyLog.sleepHours}</span>
            <span className="text-slate-400 text-xs font-medium">시간</span>
          </div>
        </div>
      </div>

      {/* Weight Input */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-slate-800">
            <TrendingDown size={20} className="text-indigo-500" />
            체중 기록 <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">0.00kg</span>
          </h3>
          <div className="flex gap-1">
            {(['2w', '4w'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${chartRange === range ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ display: 'none' }}
                formatter={(value: number) => [`${value.toFixed(2)} kg`, '체중']}
              />
              <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <input 
            type="number" 
            step="0.01"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="bg-transparent text-xl font-bold w-full outline-none"
            placeholder="00.00"
          />
          <span className="text-slate-400 font-bold">kg</span>
          <button 
            onClick={handleWeightSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      {/* BMI Info */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">현재 BMI</p>
            <h2 className="text-3xl font-bold">{bmi.toFixed(2)}</h2>
            <div className="inline-block px-2 py-0.5 bg-indigo-500 rounded text-[10px] font-bold">
              {getBmiStatus(bmi)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">목표까지</p>
            <p className="text-lg font-bold">-{Math.max(0, profile.currentWeight - profile.targetWeight).toFixed(2)} kg</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;
