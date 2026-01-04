
import React from 'react';
import { UserProfile } from '../types';
import { AlertTriangle, RotateCcw, Droplets } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onReset: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate, onReset }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <h1 className="text-2xl font-bold text-slate-900">설정</h1>
      
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">기본 정보</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">이름</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => onUpdate({...profile, name: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">신장 (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={profile.height}
                  onChange={(e) => onUpdate({...profile, height: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">목표 체중 (kg)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={profile.targetWeight}
                  onChange={(e) => onUpdate({...profile, targetWeight: parseFloat(parseFloat(e.target.value).toFixed(2))})}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">관리 모드</h3>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {(['diet', 'maintenance'] as const).map(phase => (
              <button
                key={phase}
                onClick={() => onUpdate({...profile, phase})}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  profile.phase === phase ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                {phase === 'diet' ? '감량기' : '유지기'}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-indigo-600 rounded-3xl p-6 text-white space-y-4 shadow-lg shadow-indigo-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Droplets size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">마운자로(Tirzepatide) 모드</p>
                <p className="text-[10px] opacity-70">투여 관리 기능을 활성화합니다.</p>
              </div>
            </div>
            <button
              onClick={() => onUpdate({...profile, mounjaroActive: !profile.mounjaroActive})}
              className={`w-12 h-6 rounded-full transition-colors relative ${profile.mounjaroActive ? 'bg-white' : 'bg-white/30'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${profile.mounjaroActive ? 'left-7 bg-indigo-600' : 'left-1 bg-white'}`} />
            </button>
          </div>
          
          {profile.mounjaroActive && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="opacity-70">투여 시작일</span>
                <input 
                  type="date"
                  value={profile.mounjaroStartDate || ''}
                  onChange={(e) => onUpdate({...profile, mounjaroStartDate: e.target.value})}
                  className="bg-transparent font-bold outline-none"
                />
              </div>
            </div>
          )}
        </section>

        <section className="pt-4 border-t border-slate-100">
          <button 
            onClick={onReset}
            className="w-full p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
            데이터 초기화
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4">
            초기화 시 모든 로컬 기록이 영구적으로 삭제됩니다.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;
