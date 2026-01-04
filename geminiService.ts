
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyLog } from "./types";

export const analyzeNutrition = async (foodDescription: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this food description and estimate the calories: "${foodDescription}". Return ONLY a JSON object with "name" and "calories" (integer).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const getCoachResponse = async (profile: UserProfile, logs: DailyLog[], userMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const age = new Date().getFullYear() - new Date(profile.birthDate).getFullYear();
  const bmi = profile.currentWeight / ((profile.height / 100) ** 2);
  
  const recentStats = logs.slice(-7).map(l => 
    `- ${l.date}: ${l.weight}kg, ${l.meals.reduce((s, m) => s + m.calories, 0)}kcal, ${l.exercises.length}건 운동`
  ).join('\n');

  const systemInstruction = `
    당신은 전문 헬스/웰니스 코치입니다. 사용자의 이름은 ${profile.name}이며, 나이는 ${age}세입니다.
    현재 BMI는 ${bmi.toFixed(1)}이며 관리 단계는 [${profile.phase === 'diet' ? '감량기' : '유지기'}]입니다.
    사용자는 마운자로를 2개월간 사용하고 이후 식단/운동으로 전환할 계획입니다.
    
    코칭 지침:
    1. 식단: 아침/점심/저녁/간식을 분석하고 다이어트식 여부를 판단하세요.
    2. 운동: 나이에 적합한 강도를 추천하고, 특히 '허리에 좋은 운동' 등 특정 요구사항을 반영하세요.
    3. 피부: 아침(세안/머리), 저녁(샤워/세안/머리) 루틴에 맞춘 피부 건강 조언을 하세요.
    4. 마운자로: 효능(식욕억제, 혈당조절)과 부작용 관리에 대해 전문적으로 조언하세요.
    
    최근 데이터:
    ${recentStats}
    
    답변은 항상 한국어로 친절하고 전문적으로 작성하세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: userMessage,
    config: {
      systemInstruction
    }
  });
  
  return response.text;
};
