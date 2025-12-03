import * as fs from 'fs';
import * as path from 'path';

interface AnalyzedEssay {
  title: string;
  url: string;
  year?: string;
  content: string;
  scrapedAt: string;
  analysis: {
    primaryCategory: string;
    difficulty: string;
    koreanSummary: string;
    keyTakeaways: string[];
    relevanceToKoreanContext: string;
    analyzedAt: string;
  };
}

// 카테고리별 컨텍스트 정보
const categoryContexts = {
  Mindset: {
    greeting: '안녕하세요! 오늘은 성공하는 창업자와 PM의 사고방식에 대해 이야기해볼까요?',
    focus: '사고방식과 태도',
    actionPrefix: '💡 오늘 실천할 한 가지',
  },
  Product: {
    greeting: '안녕하세요! 사용자에게 진짜 가치를 전하는 제품 만들기, 함께 알아봅시다.',
    focus: '제품 개발의 핵심',
    actionPrefix: '💡 오늘 바로 시작하기',
  },
  Fundraising: {
    greeting: '안녕하세요! 투자 유치의 핵심 전략을 정리했습니다.',
    focus: '투자 유치 전략',
    actionPrefix: '💡 투자 유치 실전 팁',
  },
  'Operations & Execution': {
    greeting: '안녕하세요! 스타트업 운영과 실행의 핵심을 짚어봅니다.',
    focus: '운영과 실행의 원칙',
    actionPrefix: '💡 당장 실행하기',
  },
  'Go-to-Market': {
    greeting: '안녕하세요! 시장 진입과 성장의 핵심 전략을 살펴봅니다.',
    focus: '시장 공략 전략',
    actionPrefix: '💡 시장 진입 첫걸음',
  },
  'Productivity & Efficiency': {
    greeting: '안녕하세요! 생산성을 높이는 실천법을 소개합니다.',
    focus: '효율적인 업무 방식',
    actionPrefix: '💡 생산성 높이기',
  },
};

// 제목과 카테고리 기반 맞춤형 Summary 생성
function generateCustomSummary(essay: AnalyzedEssay): string {
  const category = essay.analysis.primaryCategory as keyof typeof categoryContexts;
  const context = categoryContexts[category];
  const title = essay.title;

  // 카테고리와 제목별 맞춤 Summary
  const summaries: Record<string, string> = {
    // Mindset
    'How to Do Great Work': `${context.greeting}

**위대한 일을 하려면 어떻게 해야 할까요?**
폴 그레이엄은 단순히 열심히 일하는 것을 넘어, 진정으로 좋아하는 일을 찾고 그 안에서 지속적으로 성장하는 것의 중요성을 강조합니다. 타고난 재능보다는 꾸준한 호기심과 실험 정신이 더 중요합니다.

**핵심 포인트**
• 자신이 진정으로 흥미를 느끼는 분야를 찾으세요
• 완벽을 추구하기보다 빠르게 시작하고 개선하세요
• 동료들과의 대화를 통해 생각을 발전시키세요

${context.actionPrefix}
오늘 한 시간만이라도 진짜 하고 싶었던 프로젝트에 투자해보세요. 작은 시작이 큰 변화를 만듭니다.`,

    'Founder Mode': `${context.greeting}

**창업자 모드 vs 관리자 모드**
에어비앤비의 브라이언 체스키는 회사가 성장하면서 전문 경영인처럼 운영하라는 조언을 받았지만, 오히려 그것이 회사를 망쳤습니다. 창업자만이 할 수 있는 방식으로 회사를 운영할 때 진정한 성장이 가능합니다.

**핵심 포인트**
• "좋은 사람 뽑고 맡기기"는 항상 정답이 아닙니다
• 창업자는 조직 전체와 직접 소통해야 합니다
• 전통적 경영 방식을 맹신하지 마세요

${context.actionPrefix}
오늘 팀 전체 회의를 열고 직접 현장의 목소리를 들어보세요. 중간 관리자를 거치지 않고요.`,

    'How to Get Startup Ideas': `좋은 스타트업 아이디어는 어디서 나올까요?

**문제에서 시작하세요**
성공한 스타트업들은 창업자 자신이 겪은 문제를 해결하면서 시작되었습니다. 억지로 아이디어를 짜내려 하지 말고, 일상에서 느끼는 불편함에 주목하세요.

**핵심 포인트**
• 내가 직접 겪은 문제가 최고의 아이디어입니다
• 작아 보이는 시장도 괜찮습니다 - 크게 성장할 수 있습니다
• 남들이 무시하는 아이디어일수록 기회일 수 있습니다

${context.actionPrefix}
내가 오늘 가장 짜증났던 순간을 떠올려보세요. 그것이 바로 스타트업 아이디어의 씨앗입니다.`,

    'Do Things that Don\'t Scale': `초기 스타트업의 성공 비결은 무엇일까요?

**확장 불가능한 일을 하세요**
에어비앤비 창업자들은 초기에 직접 사용자 집을 찾아가 사진을 찍어줬습니다. 스케일되지 않는 이런 행동들이 오히려 성장의 발판이 됩니다.

**핵심 포인트**
• 초기에는 사용자 한 명 한 명을 직접 찾아가세요
• 수작업으로 해결하면서 제품을 완벽하게 만드세요
• 100명의 열광하는 팬이 10,000명의 무관심보다 낫습니다

${context.actionPrefix}
오늘 잠재 고객 한 명에게 직접 연락해서 30분 대화를 나눠보세요.`,

    'Life is Short': `인생은 짧습니다. 어떻게 살아야 할까요?

**정말 중요한 것에 집중하세요**
우리는 쓸데없는 일에 시간을 낭비하며 살아갑니다. 인생이 짧다는 것을 인정하고, 정말 중요한 사람들과 일에 집중해야 합니다.

**핵심 포인트**
• 불필요한 회의와 약속을 과감히 거절하세요
• 좋아하는 사람들과 더 많은 시간을 보내세요
• 미루던 일을 지금 바로 시작하세요

${context.actionPrefix}
오늘 일정표를 보고, 정말 중요하지 않은 일 하나를 취소해보세요.`,

    'How to Raise Money': `성공적인 투자 유치의 비결은 무엇일까요?

**투자자가 원하는 것을 이해하세요**
투자자들은 빠르게 성장하는 회사를 찾습니다. 화려한 PT보다는 제품과 성장 지표가 더 중요합니다. 여러 투자자를 동시에 만나고, 빠르게 결정을 이끌어내세요.

**핵심 포인트**
• 투자받기 전에 먼저 성장을 증명하세요
• 여러 투자자를 동시에 만나 경쟁 구도를 만드세요
• 길게 끄는 투자자는 과감히 포기하세요

${context.actionPrefix}
투자 덱을 만들기 전에, 이번 주 성장 지표를 먼저 점검해보세요.`,

    'Mean People Fail': `성공하려면 착해야 할까요?

**나쁜 사람들은 결국 실패합니다**
단기적으로는 비열하게 구는 것이 이득처럼 보일 수 있습니다. 하지만 장기적으로는 착한 사람들이 더 많은 기회를 얻고 성공합니다.

**핵심 포인트**
• 직원과 파트너를 공정하게 대하세요
• 단기적 이익보다 장기적 신뢰가 중요합니다
• 좋은 평판은 가장 강력한 자산입니다

${context.actionPrefix}
오늘 함께 일하는 사람에게 진심 어린 감사 인사를 전해보세요.`,
  };

  // 매칭되는 Summary가 있으면 반환
  if (summaries[title]) {
    return summaries[title];
  }

  // 기본 템플릿
  return generateDefaultSummary(essay, context);
}

function generateDefaultSummary(
  essay: AnalyzedEssay,
  context: typeof categoryContexts.Mindset
): string {
  const { title, analysis } = essay;

  // Key Takeaways를 활용
  const points = analysis.keyTakeaways.slice(0, 3);

  return `${context.greeting}

**"${title}"의 핵심**
${analysis.koreanSummary}

**핵심 포인트**
${points.map((p) => `• ${p}`).join('\n')}

${context.actionPrefix}
${analysis.relevanceToKoreanContext}

오늘 하나라도 실천해보세요. 작은 변화가 큰 차이를 만듭니다.`;
}

async function updateMarkdownFile(
  essay: AnalyzedEssay,
  newSummary: string
): Promise<void> {
  const { analysis } = essay;
  const categoryDir = path.join(
    process.cwd(),
    'essays',
    analysis.primaryCategory,
    analysis.difficulty
  );

  const filename =
    essay.title
      .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
      .toLowerCase() + '.md';

  const filepath = path.join(categoryDir, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️  File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(filepath, 'utf-8');

  // Summary 섹션을 새로운 내용으로 교체
  const summaryRegex = /## 요약 \(Summary\)\n\n[\s\S]*?\n\n---/;
  const newSummarySection = `## 요약 (Summary)\n\n${newSummary}\n\n---`;

  const updatedContent = content.replace(summaryRegex, newSummarySection);

  fs.writeFileSync(filepath, updatedContent, 'utf-8');
  console.log(`  ✅ Summary updated (${newSummary.length} chars)`);
}

async function updateAllSummaries() {
  console.log('🚀 Starting improved summary update...\n');

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(
    fs.readFileSync(analyzedPath, 'utf-8')
  );

  console.log(`📚 Loaded ${essays.length} essays\n`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    console.log(`[${i + 1}/${essays.length}] ${essay.title}`);

    try {
      const newSummary = generateCustomSummary(essay);
      await updateMarkdownFile(essay, newSummary);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error:`, error);
      errorCount++;
    }

    // Progress report every 50 essays
    if ((i + 1) % 50 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
      const remaining = Math.round(
        (elapsed / (i + 1)) * (essays.length - i - 1)
      );
      console.log(
        `\n📊 Progress: ${i + 1}/${essays.length} | Elapsed: ${elapsed}min | Remaining: ~${remaining}min\n`
      );
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log('\n✅ Summary update complete!');
  console.log(`📊 Success: ${successCount} | Errors: ${errorCount}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);
}

// Run the script
updateAllSummaries()
  .then(() => {
    console.log('\n✨ All summaries updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
