import * as fs from 'fs';
import * as path from 'path';

// 수동으로 작성한 분석 결과
// 제목을 기반으로 카테고리와 난이도를 할당

const manualAnalysis: Record<string, {
  primaryCategory: string;
  difficulty: '초급' | '중급' | '고급';
  koreanSummary: string;
  keyTakeaways: string[];
  relevanceToKoreanContext: string;
}> = {
  "How to Do Great Work": {
    primaryCategory: "Mindset",
    difficulty: "고급",
    koreanSummary: "위대한 일을 하기 위한 핵심 원칙과 사고방식을 다룹니다. 자신이 진정으로 흥미있는 분야를 찾고, 지식의 경계에 도달한 후 그 틈새를 발견하는 과정을 설명합니다.",
    keyTakeaways: [
      "자신의 적성과 깊은 흥미가 있는 분야를 선택하라",
      "지식의 경계(frontier)에 도달하여 새로운 틈새(gap)를 발견하라",
      "진심(earnest)되게 일하고 지적으로 정직하라",
      "계획보다는 흥미를 따라가며 '상승풍(upwind)'을 유지하라"
    ],
    relevanceToKoreanContext: "한국의 PM/PO들이 단기 성과에 집중하기 쉬운 환경에서, 장기적 관점에서 진정으로 의미 있는 일을 찾는 방법을 제시합니다."
  },
  "Founder Mode": {
    primaryCategory: "Operations & Execution",
    difficulty: "중급",
    koreanSummary: "창업자가 회사를 운영하는 방식과 전문 경영인의 방식이 근본적으로 다르다는 점을 설명합니다. 창업자는 세부사항까지 직접 관여해야 합니다.",
    keyTakeaways: [
      "창업자 모드는 매니저 모드와 다르다",
      "스케일업 단계에서도 창업자의 직접적인 관여가 중요하다",
      "전통적인 경영 조언을 맹목적으로 따르지 말라"
    ],
    relevanceToKoreanContext: "한국 스타트업에서 초기 성장 후 전문 경영인을 영입하는 관행에 대해 재고하게 만드는 인사이트를 제공합니다."
  },
  "How to Get Startup Ideas": {
    primaryCategory: "Product",
    difficulty: "중급",
    koreanSummary: "좋은 스타트업 아이디어를 찾는 방법을 설명합니다. 문제를 찾으려고 노력하기보다는, 자신이 겪는 문제를 해결하는 것이 가장 좋은 방법입니다.",
    keyTakeaways: [
      "자신이 직접 겪는 문제를 해결하라",
      "사람들이 원한다고 말하는 것이 아니라 실제로 원하는 것을 만들라",
      "'살아있는 미래(living in the future)'에서 무엇이 빠졌는지 찾아라"
    ],
    relevanceToKoreanContext: "한국에서 유행하는 아이디어를 따라하기보다, 실제 사용자 문제에서 출발하는 것의 중요성을 강조합니다."
  },
  "Do Things that Don't Scale": {
    primaryCategory: "Operations & Execution",
    difficulty: "초급",
    koreanSummary: "초기 스타트업은 확장 불가능한 일들을 직접 해야 합니다. 초기 사용자를 직접 모집하고, 뛰어난 고객 경험을 제공하는 것이 중요합니다.",
    keyTakeaways: [
      "초기에는 확장되지 않는 일을 직접 하라",
      "초기 사용자를 수동으로 모집하라",
      "고객에게 놀라운 경험을 제공하라"
    ],
    relevanceToKoreanContext: "한국 스타트업이 처음부터 자동화와 확장성에 집착하는 경향을 경계하고, 초기 고객과의 깊은 관계 형성이 중요함을 알려줍니다."
  }
};

async function analyzeEssaysManually() {
  console.log('🚀 Starting manual essay analysis...\n');

  const rawPath = path.join(process.cwd(), 'data', 'essays-raw.json');
  const essays = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

  console.log(`📚 Loaded ${essays.length} essays\n`);
  console.log('⚠️  Manual analysis in progress...');
  console.log('This file contains pre-analyzed sample data.');
  console.log('Full analysis will be completed by Claude directly.\n');

  // 여기서는 샘플만 저장
  const analyzedEssays = essays.slice(0, 4).map((essay: any) => {
    const analysis = manualAnalysis[essay.title];
    if (analysis) {
      return {
        ...essay,
        analysis: {
          ...analysis,
          analyzedAt: new Date().toISOString()
        }
      };
    }
    return null;
  }).filter(Boolean);

  const outputPath = path.join(process.cwd(), 'data', 'essays-analyzed-sample.json');
  fs.writeFileSync(outputPath, JSON.stringify(analyzedEssays, null, 2), 'utf-8');

  console.log(`✅ Sample analysis saved to: ${outputPath}`);
  console.log(`📊 Analyzed ${analyzedEssays.length} essays`);
}

analyzeEssaysManually().catch(console.error);
