
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DailyLog, ChatMessage } from '../types';
import { getCoachResponse } from '../geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface CoachChatProps {
  profile: UserProfile;
  logs: DailyLog[];
}

const CoachChat: React.FC<CoachChatProps> = ({ profile, logs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `안녕하세요 ${profile.name}님! 당신의 개인 건강 코치입니다. 오늘 식단이나 운동, 혹은 마운자로 관리에 대해 궁금한 점이 있으신가요?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getCoachResponse(profile, logs, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "죄송합니다. 답변을 생성하는 중 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-sm">AI 헬스 코치</h2>
          <p className="text-[10px] text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 실시간 분석 중
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {msg.text.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={16} />
              <span className="text-xs text-slate-500">생각 중...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="코치에게 질문하기..."
            className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
