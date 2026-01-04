
import React from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">내 정보 설정</h1>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">이름</label>
          <input 
            type="text" 
            value={profile.name}
            onChange={(e) => onUpdate({...profile, name: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">생년월일</label>
          <input 
            type="date" 
            value={profile.birthDate}
            onChange={(e) => onUpdate({...profile, birthDate: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">신장 (cm)</label>
            <input 
              type="number" 
              step="0.1"
              value={profile.height}
              onChange={(e) => onUpdate({...profile, height: parseFloat(e.target.value)})}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">목표 체중 (kg)</label>
            <input 
              type="number" 
              step="0.01"
              value={profile.targetWeight}
              onChange={(e) => onUpdate({...profile, targetWeight: parseFloat(parseFloat(e.target.value).toFixed(2))})}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="00.00"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase">관리 단계</label>
          <div className="flex gap-2">
            {(['diet', 'maintenance'] as const).map(phase => (
              <button
                key={phase}
                onClick={() => onUpdate({...profile, phase})}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                  profile.phase === phase ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {phase === 'diet' ? '감량기' : '유지기'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
          <div className="space-y-1">
            <p className="font-bold text-sm">마운자로 투여 여부</p>
            <p className="text-[10px] text-slate-500">GLP-1 관리를 활성화합니다.</p>
          </div>
          <button
            onClick={() => onUpdate({...profile, mounjaroActive: !profile.mounjaroActive})}
            className={`w-12 h-6 rounded-full transition-colors relative ${profile.mounjaroActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.mounjaroActive ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          맞춤형 건강 가이드
        </h4>
        <p className="text-xs text-indigo-700 leading-relaxed">
          {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}세 연령대에 최적화된 
          {profile.phase === 'diet' ? ' 저칼로리 고단백 ' : ' 균형 잡힌 '} 
          영양 전략이 적용됩니다. 정밀한 <span className="font-bold">0.00kg</span> 단위 기록으로 변화를 더 세밀하게 관찰해보세요.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;
