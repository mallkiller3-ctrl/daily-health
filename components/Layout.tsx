
import React from 'react';
import { Home, ClipboardList, User, Camera, MessageSquareText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'logs', icon: ClipboardList, label: '기록' },
    { id: 'body', icon: Camera, label: '눈바디' },
    { id: 'stats', icon: MessageSquareText, label: '코칭' },
    { id: 'profile', icon: User, label: '프로필' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-xl overflow-hidden">
      <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-slate-400'
            }`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
