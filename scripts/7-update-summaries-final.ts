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

// 카테고리별 템플릿 정의
const templates = {
  Mindset: {
    greeting: '안녕하세요! 성공하는 창업자와 PM의 사고방식에 대해 이야기해볼까요?',
    closing: '작은 변화가 큰 차이를 만듭니다. 오늘부터 시작해보세요!',
  },
  Product: {
    greeting: '안녕하세요! 사용자에게 진짜 가치를 전하는 제품 만들기, 함께 알아봅시다.',
    closing: '사용자의 진짜 문제를 해결할 때 비로소 좋은 제품이 탄생합니다.',
  },
  Fundraising: {
    greeting: '안녕하세요! 투자 유치의 핵심 전략을 정리했습니다.',
    closing: '준비된 창업자에게 기회가 찾아옵니다. 한 단계씩 준비해나가세요.',
  },
  'Operations & Execution': {
    greeting: '안녕하세요! 스타트업 운영과 실행의 핵심을 짚어봅니다.',
    closing: '실행이 전략을 이깁니다. 오늘 바로 한 가지를 실천해보세요.',
  },
  'Go-to-Market': {
    greeting: '안녕하세요! 시장 진입과 성장의 핵심 전략을 살펴봅니다.',
    closing: '올바른 전략과 빠른 실행이 성장을 가속화합니다.',
  },
  'Productivity & Efficiency': {
    greeting: '안녕하세요! 생산성을 높이는 실천법을 소개합니다.',
    closing: '시간은 가장 소중한 자산입니다. 효율적으로 사용하세요.',
  },
};

// 핵심 에세이별 맞춤형 Summary
function generateCustomSummary(essay: AnalyzedEssay): string {
  const category = essay.analysis.primaryCategory as keyof typeof templates;
  const template = templates[category] || templates.Mindset;
  const title = essay.title;

  // 주요 에세이들의 맞춤형 Summary
  const customSummaries: Record<string, string> = {
    'Founder Mode': `${template.greeting}

**창업자 모드 vs 관리자 모드**

에어비앤비의 브라이언 체스키는 회사가 성장하면서 전문 경영인처럼 운영하라는 조언을 받았습니다. "좋은 사람을 뽑고 맡기세요"라는 조언이었죠. 하지만 그 결과는 참담했습니다.

**왜 전통적인 방식이 실패할까요?**
전문 경영인을 위한 "관리자 모드"는 창업자에게는 맞지 않습니다. 창업자는 직속 부하를 통해서만 회사와 소통하는 것이 아니라, 조직 전체와 직접 연결되어야 합니다. 스티브 잡스가 애플에서 가장 중요한 100명을 모아 수련회를 한 것처럼요.

**실천 포인트**
• 조직도만 보고 판단하지 마세요 - 현장의 목소리를 직접 들으세요
• "세부 관리는 나쁘다"는 말에 속지 마세요 - 중요한 부분은 깊이 관여해야 합니다
• 전문 경영인의 조언을 맹신하지 마세요 - 창업자만의 방식을 찾으세요

💡 **오늘 바로 실천하기**
오늘 팀 전체 회의를 열고 직접 현장의 목소리를 들어보세요. 중간 관리자를 거치지 말고요.

${template.closing}`,

    'How to Get Startup Ideas': `${template.greeting}

**좋은 스타트업 아이디어는 어디서 나올까요?**

많은 사람들이 억지로 아이디어를 짜내려고 합니다. 하지만 최고의 아이디어는 바로 여러분이 직접 겪은 문제에서 나옵니다.

**문제에서 시작하세요**
구글의 창업자들은 웹 검색이 형편없다는 것을 직접 경험했습니다. 에어비앤비 창업자들은 월세를 낼 돈이 필요했죠. 성공한 스타트업들의 공통점은 창업자 자신의 문제를 해결하면서 시작되었다는 것입니다.

**실천 포인트**
• 일상에서 느끼는 불편함에 주목하세요 - 그것이 아이디어의 씨앗입니다
• 작아 보이는 시장도 괜찮습니다 - 페이스북도 하버드 학생들만의 서비스로 시작했어요
• 남들이 "쓸모없다"고 하는 아이디어일수록 기회일 수 있습니다

💡 **오늘 바로 실천하기**
오늘 하루 동안 가장 짜증났던 순간을 메모해보세요. 그것이 바로 스타트업 아이디어의 시작입니다.

${template.closing}`,

    'Do Things that Don\'t Scale': `${template.greeting}

**초기 스타트업의 성공 비결**

"확장 가능한 방식으로 시작하세요"라는 조언, 들어보셨죠? 사실 이 조언은 틀렸습니다.

**스케일되지 않는 일을 하세요**
에어비앤비 창업자들은 초기에 직접 사용자 집을 찾아가 사진을 찍어줬습니다. 폴 그레이엄은 YC 초기 배치의 모든 창업자와 직접 저녁을 먹었죠. 이런 "스케일되지 않는" 행동들이 오히려 성장의 발판이 됩니다.

**실천 포인트**
• 사용자 한 명 한 명을 직접 찾아가세요 - 자동화는 나중의 일입니다
• 수작업으로 해결하면서 제품을 완벽하게 만드세요
• 100명의 열광하는 팬이 10,000명의 무관심보다 훨씬 낫습니다

💡 **오늘 바로 실천하기**
오늘 잠재 고객 한 명에게 직접 연락해서 30분 대화를 나눠보세요. 그들의 진짜 문제를 이해하세요.

${template.closing}`,

    'How to Raise Money': `${template.greeting}

**성공적인 투자 유치의 비결**

투자자들은 무엇을 원할까요? 화려한 PT? 멋진 사무실? 아닙니다. 그들이 원하는 것은 단 하나, "빠르게 성장하는 회사"입니다.

**제품과 성장이 먼저입니다**
많은 창업자들이 투자받을 준비가 되기 전에 투자자를 만나러 갑니다. 하지만 최고의 투자 전략은 제품을 만들고 사용자를 확보하는 것입니다. 성장하는 회사에는 투자자들이 먼저 찾아옵니다.

**실천 포인트**
• 여러 투자자를 동시에 만나 경쟁 구도를 만드세요 - 한 명씩 만나면 불리합니다
• 길게 끄는 투자자는 과감히 포기하세요 - 시간은 소중합니다
• 투자 덱보다 성장 지표에 집중하세요 - 숫자가 말해줍니다

💡 **오늘 바로 실천하기**
투자 덱을 만들기 전에, 이번 주 성장 지표를 먼저 점검해보세요. 투자자를 설득할 만한 성장이 있나요?

${template.closing}`,

    'Life is Short': `${template.greeting}

**인생은 짧습니다**

우리는 마치 영원히 살 것처럼 행동합니다. 쓸데없는 회의에 시간을 보내고, 중요하지 않은 사람들과 약속을 잡고, 정말 하고 싶은 일은 "나중에"로 미룹니다.

**정말 중요한 것에 집중하세요**
인생이 짧다는 것을 인정하면, 우선순위가 명확해집니다. 불필요한 회의는 거절하고, 좋아하는 사람들과 더 많은 시간을 보내고, 미루던 프로젝트를 지금 시작할 수 있습니다.

**실천 포인트**
• 거절하는 법을 배우세요 - 모든 요청에 YES 할 필요는 없습니다
• 좋아하는 사람들에게 시간을 투자하세요 - 관계는 가장 소중한 자산입니다
• 미루던 일을 오늘 바로 시작하세요 - "나중에"는 오지 않습니다

💡 **오늘 바로 실천하기**
오늘 일정표를 보고, 정말 중요하지 않은 약속 하나를 취소해보세요. 그 시간에 정말 하고 싶었던 일을 하세요.

${template.closing}`,

    'Mean People Fail': `${template.greeting}

**착한 사람이 이긴다**

비즈니스에서 성공하려면 냉정하고 비열해야 한다고 생각하시나요? 사실은 정반대입니다.

**나쁜 사람들은 결국 실패합니다**
단기적으로는 비열하게 구는 것이 이득처럼 보일 수 있습니다. 하지만 장기적으로 보면, 직원들은 떠나고, 파트너들은 등을 돌리고, 기회는 사라집니다. 반면 공정하고 친절한 사람들에게는 더 많은 기회가 찾아옵니다.

**실천 포인트**
• 직원과 파트너를 공정하게 대하세요 - 단기 이익보다 장기 신뢰가 중요합니다
• 어려운 상황에서도 정직하세요 - 좋은 평판은 가장 강력한 자산입니다
• 다른 사람의 성공을 도와주세요 - 선의는 돌고 돌아 돌아옵니다

💡 **오늘 바로 실천하기**
오늘 함께 일하는 사람에게 진심 어린 감사 인사를 전해보세요. 구체적으로 무엇이 좋았는지 말해주세요.

${template.closing}`,
  };

  // 커스텀 Summary가 있으면 반환
  if (customSummaries[title]) {
    return customSummaries[title];
  }

  // 기본 템플릿 사용
  return generateDefaultSummary(essay, template);
}

function generateDefaultSummary(
  essay: AnalyzedEssay,
  template: typeof templates.Mindset
): string {
  const points = essay.analysis.keyTakeaways;

  return `${template.greeting}

**"${essay.title}"의 핵심 메시지**

${essay.analysis.koreanSummary}

**핵심 포인트**
• ${points[0] || '첫 번째 핵심을 파악하세요'}
• ${points[1] || '두 번째 핵심을 실천하세요'}
• ${points[2] || '세 번째 핵심을 기억하세요'}

**한국 맥락에서의 적용**
${essay.analysis.relevanceToKoreanContext}

💡 **오늘 바로 실천하기**
이 에세이에서 배운 내용 중 한 가지를 오늘 바로 실천해보세요. 작은 실천이 큰 변화를 만듭니다.

${template.closing}`;
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
  console.log('🚀 Starting final summary update...\n');

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

    if ((i + 1) % 50 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
      const remaining = Math.round((elapsed / (i + 1)) * (essays.length - i - 1));
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

updateAllSummaries()
  .then(() => {
    console.log('\n✨ All summaries updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
