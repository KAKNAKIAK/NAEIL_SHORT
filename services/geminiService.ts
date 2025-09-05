import { GoogleGenAI, Type } from "@google/genai";
import type { StructuredStory } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const WORLDVIEW_CONTEXT = `
아래의 캐릭터와 세계관 설정을 기반으로 스토리를 생성해줘.

### 1. 캐릭터 프로필: 내일이
내일이는 즉흥적인 여행과 미식을 통해 삶의 즐거움을 찾는 캐릭터이다. 그의 모든 여정은 예측 불가능한 상황의 연속이지만, 특유의 긍정적인 성격으로 이를 헤쳐나간다.

- **이름**: 내일이 (Naeily)
- **종족**: 아델리 펭귄 수인(獸人)
- **직업**: 여행 크리에이터 (유튜브 채널 '내일은 어디 갈까?' 운영)
- **성격**: 낙천적이고 즉흥적이다. 계획보다 직감을 믿는다. 호기심이 많고 먹는 것에 진심이다. 다소 허술한 면이 있어 종종 곤경에 처하지만, 이내 맛있는 음식으로 극복한다. (ENFP 유형)
- **좌우명**: "일단 떠나면 어떻게든 되겠지! 그리고 맛있는 게 있겠지!"
- **특기**: 어떤 식재료든 최상의 맛을 내는 식당을 찾아내는 '맛집 탐지 능력'
- **약점**: 방향치. 복잡한 골목이나 대중교통 환승에 매우 취약하다.

### 2. 내일이의 세계관: 공존의 시대
내일이가 사는 세상은 인간과 다양한 동물 수인(獸人)이 함께 사회를 이루며 살아가는 현대 지구이다. 100년 전 '대이동 시대'를 거쳐 안정적인 공존 체제를 확립했다. 내일이는 한국의 펭귄 수인 집성촌 '남극마을' 출신이며, 미지의 맛을 찾아 전 세계를 여행한다.

### 3. 주요 주변 인물
- **라이벌, 박사막 (사막여우 수인)**: 빅데이터 기반의 초정밀 여행 플래너. 내일이의 즉흥성을 비판하지만 그의 맛집 탐지 능력은 인정한다.
- **멘토, 거선생 (바다거북 수인)**: '남극마을'의 원로. 내일이에게 수수께끼 같은 조언을 던져주며 여행의 힌트를 준다.

### 4. 세계관의 핵심 주제: 좌충우돌 미식 유랑
핵심은 '예측 불가능성에서 오는 즐거움'이다. 계획대로 되지 않는 여행 속에서 숨은 맛집을 발견하고 새로운 인연을 만나며 진짜 여행의 의미를 찾아 나가는 미식 유랑기이다.
---
`;


const synopsesSchema = {
    type: Type.OBJECT,
    properties: {
        synopses: {
            type: Type.ARRAY,
            description: "Three distinct and compelling synopses about Naeily's adventure, each 3-4 sentences long, in Korean.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["synopses"],
};

const storyOnlySchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "A short story about Naeily based on the provided synopsis, about 3-5 paragraphs long. This should be in Korean.",
    },
  },
  required: ["story"],
};

const structuredStorySchema = {
  type: Type.OBJECT,
  properties: {
    introduction: {
      type: Type.STRING,
      description: "The 'Gi' (기, introduction) part of Naeily's story. Sets the scene and introduces characters. This should be in Korean.",
    },
    development: {
      type: Type.STRING,
      description: "The 'Seung' (승, development) part of Naeily's story. The plot develops and conflict begins. This should be in Korean.",
    },
    turn: {
      type: Type.STRING,
      description: "The 'Jeon' (전, turn/climax) part of Naeily's story. The turning point or climax of the plot. This should be in Korean.",
    },
    conclusion: {
      type: Type.STRING,
      description: "The 'Gyeol' (결, conclusion) part of Naeily's story. The resolution of the conflict. This should be in Korean.",
    },
  },
  required: ["introduction", "development", "turn", "conclusion"],
};

const storyCutsSchema = {
    type: Type.OBJECT,
    properties: {
        cuts: {
            type: Type.ARRAY,
            description: "A list of strings, where each string is a detailed scene-by-scene 'cut' for a webtoon or storyboard, in Korean.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["cuts"],
};

export const generateSynopses = async (idea: string): Promise<string[]> => {
    const prompt = `
      ${WORLDVIEW_CONTEXT}
      
      위의 설정을 바탕으로, 아래 아이디어에 대한 **약 60초 분량의 짧은 영상 콘텐츠로 만들기에 적합한** 흥미로운 시놉시스 3개를 한국어로 생성해주세요. 각 시놉시스는 '내일이'의 성격과 특징이 잘 드러나도록 서로 다른 관점이나 전개를 가져야 합니다.

      아이디어: "${idea}"

      결과는 반드시 3개의 시놉시스를 포함하는 JSON 배열 형식으로 응답해야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: synopsesSchema,
                temperature: 0.9,
                topP: 0.95,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (Array.isArray(parsedJson.synopses) && parsedJson.synopses.length > 0) {
            return parsedJson.synopses;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for synopses:", error);
        throw new Error("Failed to generate synopses from API.");
    }
};


export const generateStory = async (synopsis: string): Promise<string> => {
  const prompt = `
    ${WORLDVIEW_CONTEXT}

    위의 설정을 바탕으로, 주어진 시놉시스를 **약 60초 분량의 짧은 애니메이션 영상으로 만들기에 적합한** 흥미로운 단편 스토리로 만들어주세요. 전체 스토리는 간결하면서도 기승전결이 느껴져야 합니다. '내일이'의 성격과 말투, 행동이 잘 드러나게 한국어로 서술해야 합니다.

    시놉시스: "${synopsis}"

    결과는 반드시 지정된 JSON 형식으로 응답해야 합니다.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storyOnlySchema,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson.story) {
        return parsedJson.story;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for story generation:", error);
    throw new Error("Failed to generate story from API.");
  }
};

export const analyzeAndStructureStory = async (story: string): Promise<StructuredStory> => {
    const prompt = `
      ${WORLDVIEW_CONTEXT}
      
      위의 '내일이' 세계관 설정을 참고하여, 주어진 스토리를 한국의 전통적인 4단 구성인 '기승전결' 구조로 분석하고 나눠주세요. **이 스토리는 약 60초 분량의 영상 콘텐츠를 위한 것이므로, 각 부분의 분량 배분도 이를 고려해야 합니다.**

      - 기 (Introduction): 이야기의 배경과 인물을 소개하고 사건의 실마리를 제시하는 부분. (약 10-15초)
      - 승 (Development): 사건이 본격적으로 전개되고 갈등이 고조되는 부분. (약 20초)
      - 전 (Turn/Climax): 사건의 흐름이 바뀌는 전환점이자 갈등이 최고조에 이르는 부분. (약 15-20초)
      - 결 (Conclusion): 모든 갈등이 해소되고 이야기가 마무리되는 부분. (약 5-10초)

      스토리: "${story}"

      결과는 반드시 지정된 JSON 형식으로 각 부분에 해당하는 내용을 담아 응답해야 합니다.
    `;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: structuredStorySchema,
          temperature: 0.5,
        },
      });
  
      const jsonText = response.text.trim();
      const parsedJson = JSON.parse(jsonText);
  
      if (parsedJson.introduction && parsedJson.development && parsedJson.turn && parsedJson.conclusion) {
          return parsedJson as StructuredStory;
      } else {
          throw new Error("Invalid JSON structure for structured story received from API.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for story structuring:", error);
      throw new Error("Failed to structure story from API.");
    }
  };

export const generateStoryCuts = async (sectionTitle: keyof StructuredStory, sectionContent: string, fullStory: string): Promise<string[]> => {
    const sectionTimeframes = {
        introduction: { duration: "10-15초", cuts: "3-5개", korean: "기 (도입)" },
        development: { duration: "약 20초", cuts: "7-10개", korean: "승 (전개)" },
        turn: { duration: "15-20초", cuts: "6-8개", korean: "전 (위기/절정)" },
        conclusion: { duration: "5-10초", cuts: "4-6개", korean: "결 (결말)" },
    };

    const timeframe = sectionTimeframes[sectionTitle] || { duration: "15초", cuts: "5-8개", korean: sectionTitle };

    const prompt = `
        ${WORLDVIEW_CONTEXT}

        위의 '내일이' 세계관 설정을 참고하여, 아래 전체 스토리의 맥락 안에서 주어진 특정 섹션 내용을 웹툰이나 스토리보드에 사용될 수 있도록 상세한 컷(Cut) 또는 장면(Scene) 단위로 나눠주세요. 
        
        **중요: 이 스토리는 전체 약 60초 분량의 영상 콘텐츠를 위한 것입니다.** 각 컷은 이 시간 분량에 맞춰 속도감을 조절하여 구체적인 행동이나 장면 묘사를 담아야 합니다. 
        
        특히, 이 [${timeframe.korean}] 섹션은 전체 60초 중 **약 ${timeframe.duration}** 정도를 차지합니다. 따라서, **약 ${timeframe.cuts}** 정도의 컷으로 나누는 것이 가장 적절합니다. 이 가이드라인을 엄격하게 지켜주세요.

        ### 전체 스토리 (참고용):
        "${fullStory}"

        ### 분석할 섹션: [${timeframe.korean}]
        "${sectionContent}"

        결과는 반드시 지정된 JSON 형식으로 각 컷의 내용을 담은 문자열 배열로 응답해야 합니다.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storyCutsSchema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (Array.isArray(parsedJson.cuts)) {
            return parsedJson.cuts;
        } else {
            throw new Error("Invalid JSON structure for story cuts received from API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for story cuts:", error);
        throw new Error("Failed to generate story cuts from API.");
    }
};