
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DailyTracker from './components/DailyTracker';
import ProfileSettings from './components/ProfileSettings';
import CoachChat from './components/CoachChat';
import { DailyLog, UserProfile, BodyCheckPhoto } from './types';
import { Camera, Trash2 } from 'lucide-react';

const INITIAL_PROFILE: UserProfile = {
  name: '사용자',
  birthDate: '1990-01-01',
  gender: 'male',
  height: 175,
  currentWeight: 80.00,
  targetWeight: 70.00,
  phase: 'diet',
  mounjaroActive: false
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zenhealth_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('zenhealth_logs');
    if (saved) return JSON.parse(saved);
    return []; // Start with empty logs instead of mock data
  });

  const [bodyChecks, setBodyChecks] = useState<BodyCheckPhoto[]>(() => {
    const saved = localStorage.getItem('zenhealth_bodychecks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('zenhealth_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('zenhealth_logs', JSON.stringify(logs));
    localStorage.setItem('zenhealth_bodychecks', JSON.stringify(bodyChecks));
  }, [logs, bodyChecks]);

  const todayDate = getTodayDate();
  const currentLog = logs.find(l => l.date === todayDate) || {
    date: todayDate,
    weight: logs.length > 0 ? logs[logs.length - 1].weight : profile.currentWeight,
    sleepHours: 7,
    meals: [],
    exercises: [],
    skincare: { morning: false, evening: false },
    mounjaroDose: false,
    mounjaroNotes: ''
  };

  const updateCurrentLog = (updatedLog: DailyLog) => {
    const exists = logs.findIndex(l => l.date === todayDate);
    let newLogs;
    if (exists !== -1) {
      newLogs = [...logs];
      newLogs[exists] = updatedLog;
    } else {
      newLogs = [...logs, updatedLog];
    }
    setLogs(newLogs);
    
    // Update profile current weight only if it's the most recent log
    if (updatedLog.date === todayDate) {
      setProfile(prev => ({...prev, currentWeight: updatedLog.weight}));
    }
  };

  const resetAllData = () => {
    if (window.confirm("모든 기록과 프로필 설정이 초기화됩니다. 계속하시겠습니까?")) {
      localStorage.clear();
      setProfile(INITIAL_PROFILE);
      setLogs([]);
      setBodyChecks([]);
      setActiveTab('home');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: BodyCheckPhoto = {
          id: Math.random().toString(36).substr(2, 9),
          date: getTodayDate(),
          imageUrl: reader.result as string
        };
        setBodyChecks([newPhoto, ...bodyChecks]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deletePhoto = (id: string) => {
    setBodyChecks(bodyChecks.filter(p => p.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            profile={profile} 
            dailyLog={currentLog} 
            history={logs}
          />
        );
      case 'logs':
        return <DailyTracker log={currentLog} onUpdateLog={updateCurrentLog} />;
      case 'body':
        return (
          <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">바디체크</h1>
              <label className="bg-indigo-600 text-white p-2 rounded-full shadow-lg cursor-pointer active:scale-95 transition-all">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </header>
            
            <div className="grid grid-cols-2 gap-4">
              {bodyChecks.length === 0 && (
                <div className="col-span-2 py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  첫 사진을 업로드하세요
                </div>
              )}
              {bodyChecks.map(photo => (
                <div key={photo.id} className="relative aspect-[3/4] bg-slate-200 rounded-2xl overflow-hidden shadow-sm group">
                  <img src={photo.imageUrl} alt="Body Check" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white font-bold">{photo.date}</p>
                  </div>
                  <button 
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'stats':
        return <CoachChat profile={profile} logs={logs} />;
      case 'profile':
        return <ProfileSettings profile={profile} onUpdate={setProfile} onReset={resetAllData} />;
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
