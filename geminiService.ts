import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyLog } from "./types";

// Always initialize GoogleGenAI using the process.env.API_KEY named parameter.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeNutrition = async (foodDescription: string) => {
  const ai = getAI();
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
        },
        required: ["name", "calories"]
      }
    }
  });
  // Use the .text property to access the generated content.
  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr);
};

export const getCoachResponse = async (profile: UserProfile, logs: DailyLog[], userMessage: string) => {
  const ai = getAI();
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
    1. 식단: 사용자가 기록한 음식을 분석하고 격려해주세요.
    2. 운동: 나이와 현재 체중에 맞는 운동 강도를 추천하세요.
    3. 마운자로: 투여 기록을 확인하고 컨디션 조언을 해주세요.
    
    최근 데이터:
    ${recentStats}
    
    답변은 한국어로 친절하고 간결하게 작성하세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: userMessage,
    config: {
      systemInstruction
    }
  });
  
  // Use the .text property to access the generated content.
  return response.text || "";
};