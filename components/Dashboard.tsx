
import React, { useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import { TrendingDown, Moon, Flame, Droplets, Calendar, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  history: DailyLog[];
}

type ChartRange = '1m' | '2m' | '3m' | '4m';

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, history }) => {
  const [chartRange, setChartRange] = useState<ChartRange>('1m');

  const bmi = profile.currentWeight / ((profile.height / 100) ** 2);
  const getBmiStatus = (val: number) => {
    if (val < 18.5) return '저체중';
    if (val < 23) return '정상';
    if (val < 25) return '과체중';
    return '비만';
  };

  // 기간별 일수 계산
  const rangeToDays = {
    '1m': 30,
    '2m': 60,
    '3m': 90,
    '4m': 120
  };

  // 차트 데이터 가공
  const chartData = history.slice(-rangeToDays[chartRange]).map(log => ({
    // 기간이 길어지면 날짜 형식을 더 간결하게 (MM/DD)
    date: `${log.date.split('-')[1]}/${log.date.split('-')[2]}`,
    weight: parseFloat(log.weight.toFixed(2))
  }));

  // X축 레이블이 너무 촘촘하게 표시되지 않도록 간격 계산
  const getInterval = () => {
    if (chartRange === '1m') return 6; // 약 일주일 단위
    if (chartRange === '2m') return 13; // 약 2주일 단위
    return 29; // 약 한 달 단위
  };

  const totalCalories = dailyLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
  
  // 마운자로 상태 계산
  const lastDoseLog = [...history].reverse().find(l => l.mounjaroDose);
  const daysSinceDose = lastDoseLog 
    ? Math.floor((new Date().getTime() - new Date(lastDoseLog.date).getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-indigo-600">{profile.name}</span>님의 리포트
          </h1>
          <p className="text-slate-500 text-xs">최근 {rangeToDays[chartRange]}일간의 데이터를 기반으로 분석합니다.</p>
        </div>
        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
          <Award size={24} />
        </div>
      </header>

      {/* 마운자로 위젯 */}
      {profile.mounjaroActive && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Droplets size={18} />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">마운자로 추적</span>
            </div>
            {lastDoseLog && (
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold">
                최근 투여: {lastDoseLog.date}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm opacity-80 mb-1">투여 후 경과</p>
              <h2 className="text-3xl font-bold">
                {daysSinceDose !== null ? `${daysSinceDose}일째` : '기록 없음'}
              </h2>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex-1">
              <p className="text-sm opacity-80 mb-1">권장 사항</p>
              <h2 className="text-sm font-bold leading-tight">
                {daysSinceDose !== null && daysSinceDose <= 7 
                  ? '현재 약효가 지속되는 시기입니다.' 
                  : '투여 주기를 확인해주세요.'}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-rose-500">
            <Flame size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider">오늘 섭취</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{totalCalories}</span>
            <span className="text-slate-400 text-xs">kcal</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-500">
            <Moon size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider">오늘 수면</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{dailyLog.sleepHours}</span>
            <span className="text-slate-400 text-xs">시간</span>
          </div>
        </div>
      </div>

      {/* 체중 차트 섹션 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingDown size={20} className="text-indigo-500" />
              체중 변화 추이
            </h3>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-full w-full">
            {(['1m', '2m', '3m', '4m'] as ChartRange[]).map(range => (
              <button 
                key={range}
                onClick={() => setChartRange(range)}
                className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all ${chartRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                {range.replace('m', '개월')}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 1 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  interval={getInterval()} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8' }}
                  formatter={(value: number) => [`${value.toFixed(2)} kg`, '체중']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={chartData.length < 35 ? { r: 3, fill: '#6366f1', strokeWidth: 0 } : false} 
                  animationDuration={1000} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-300 text-xs border-2 border-dashed border-slate-100 rounded-2xl">
            차트를 그리려면 최소 2일 이상의 기록이 필요합니다.
          </div>
        )}
        
        <div className="flex justify-between items-center px-2">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">현재 체중</p>
            <p className="text-xl font-bold text-slate-800">{profile.currentWeight.toFixed(2)}kg</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">BMI 지수</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-800">{bmi.toFixed(1)}</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold text-slate-600">{getBmiStatus(bmi)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 달성률 */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-400 text-[10px] font-bold uppercase mb-1">목표까지 남은 무게</p>
            <h2 className="text-3xl font-bold">-{Math.max(0, profile.currentWeight - profile.targetWeight).toFixed(2)} kg</h2>
          </div>
          <div className="bg-indigo-500/20 p-3 rounded-2xl">
            <Calendar className="text-indigo-400" />
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500" 
            style={{ width: `${Math.min(100, Math.max(0, (profile.currentWeight - profile.targetWeight) / profile.currentWeight * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
