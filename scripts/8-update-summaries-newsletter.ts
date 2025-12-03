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

// 카테고리별 인트로 메시지
const categoryIntros = {
  Mindset: '창업을 꿈꾸지 않아도, 창업자의 사고를 배워야 하는 이유',
  Product: '좋은 제품은 트릭이 아니라 진짜 문제 해결에서 나옵니다',
  Fundraising: '투자는 숫자 게임이 아니라 신뢰 구축입니다',
  'Operations & Execution': '실행력이 전략을 이깁니다',
  'Go-to-Market': '시장은 만드는 것이지 찾는 것이 아닙니다',
  'Productivity & Efficiency': '시간을 쓰는 방식이 성과를 결정합니다',
};

// 주요 에세이별 맞춤형 Newsletter
const customNewsletters: Record<string, { intro: string; summary: string; action: string }> = {
  'Founder Mode': {
    intro: '🎯 전문 경영인의 조언이 왜 스타트업을 망칠까요?',
    summary: `에어비앤비의 브라이언 체스키는 회사가 커지면서 "좋은 사람을 뽑고 맡기세요"라는 조언을 받았습니다. 하지만 이 전통적인 경영 방식은 참담한 결과를 가져왔죠. Paul Graham은 이 에세이에서 창업자만의 독특한 운영 방식인 "Founder Mode"를 소개합니다.

핵심은 이겁니다: 창업자는 전문 경영인처럼 조직도의 직속 부하를 통해서만 소통할 필요가 없습니다. 스티브 잡스가 애플에서 가장 중요한 100명을 모아 수련회를 한 것처럼, 조직 전체와 직접 연결되어야 합니다. "세부 관리는 나쁘다"는 통념을 버리고, 중요한 부분에는 깊이 관여하세요. 창업자만의 방식을 찾는 것이 성장의 열쇠입니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n오늘 팀 전체 회의를 열고 직접 현장의 목소리를 들어보세요. 중간 관리자를 거치지 않고요.',
  },

  'How to Get Startup Ideas': {
    intro: '🎯 최고의 스타트업 아이디어는 어디서 나올까요?',
    summary: `많은 사람들이 "혁신적인 아이디어"를 찾으려고 머리를 쥐어짭니다. 하지만 Paul Graham은 정반대를 말합니다. 좋은 스타트업 아이디어는 억지로 짜내는 게 아니라, 여러분이 직접 겪은 문제에서 자연스럽게 나온다고요.

구글 창업자들은 웹 검색이 형편없다는 걸 직접 경험했습니다. 에어비앤비 창업자들은 월세를 낼 돈이 필요했죠. 성공한 스타트업들의 공통점은 창업자 자신의 문제를 해결하면서 시작되었다는 것입니다.

중요한 건 일상의 불편함에 주목하는 것입니다. 작아 보이는 시장도 괜찮습니다. 페이스북도 하버드 학생들만의 서비스로 시작했어요. 남들이 "쓸모없다"고 하는 아이디어일수록 기회일 수 있습니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n오늘 하루 동안 가장 짜증났던 순간을 메모해보세요. 그것이 바로 스타트업 아이디어의 씨앗입니다.',
  },

  'Do Things that Don\'t Scale': {
    intro: '🎯 초기 스타트업이 절대 하지 말아야 할 것: 확장성 걱정',
    summary: `"확장 가능한 방식으로 시작하세요"라는 조언, 들어보셨죠? Paul Graham은 이 조언이 틀렸다고 말합니다. 오히려 초기에는 스케일되지 않는 일을 해야 합니다.

에어비앤비 창업자들은 초기에 직접 사용자 집을 찾아가 사진을 찍어줬습니다. Paul Graham 자신도 YC 초기 배치의 모든 창업자와 직접 저녁을 먹었죠. 이런 "비효율적인" 행동들이 오히려 성장의 발판이 됩니다.

사용자 한 명 한 명을 직접 찾아가세요. 수작업으로 해결하면서 제품을 완벽하게 만드세요. 100명의 열광하는 팬이 10,000명의 무관심보다 훨씬 낫습니다. 자동화는 나중의 일입니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n오늘 잠재 고객 한 명에게 직접 연락해서 30분 대화를 나눠보세요. 그들의 진짜 문제를 이해하세요.',
  },

  'How to Raise Money': {
    intro: '🎯 투자자가 정말로 원하는 것은 무엇일까요?',
    summary: `화려한 프레젠테이션? 멋진 사무실? 아닙니다. Paul Graham은 투자자들이 원하는 것은 단 하나, "빠르게 성장하는 회사"라고 말합니다.

많은 창업자들이 준비가 되기 전에 투자자를 만나러 갑니다. 하지만 최고의 투자 전략은 제품을 만들고 사용자를 확보하는 것입니다. 성장하는 회사에는 투자자들이 먼저 찾아옵니다.

여러 투자자를 동시에 만나 경쟁 구도를 만드세요. 한 명씩 만나면 불리합니다. 길게 끄는 투자자는 과감히 포기하세요. 시간은 소중합니다. 투자 덱보다 성장 지표에 집중하세요. 숫자가 말해줍니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n투자 덱을 만들기 전에, 이번 주 성장 지표를 먼저 점검해보세요. 투자자를 설득할 만한 성장이 있나요?',
  },

  'Life is Short': {
    intro: '🎯 인생이 짧다는 걸 알면서도 왜 우리는 쓸데없는 일에 시간을 쓸까요?',
    summary: `우리는 마치 영원히 살 것처럼 행동합니다. 쓸데없는 회의에 시간을 보내고, 중요하지 않은 사람들과 약속을 잡고, 정말 하고 싶은 일은 "나중에"로 미룹니다.

Paul Graham은 인생이 짧다는 것을 인정하면 우선순위가 명확해진다고 말합니다. 불필요한 회의는 거절하고, 좋아하는 사람들과 더 많은 시간을 보내고, 미루던 프로젝트를 지금 시작할 수 있습니다.

거절하는 법을 배우세요. 모든 요청에 YES 할 필요는 없습니다. 좋아하는 사람들에게 시간을 투자하세요. 관계는 가장 소중한 자산입니다. 미루던 일을 오늘 바로 시작하세요. "나중에"는 오지 않습니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n오늘 일정표를 보고, 정말 중요하지 않은 약속 하나를 취소해보세요. 그 시간에 정말 하고 싶었던 일을 하세요.',
  },

  'Mean People Fail': {
    intro: '🎯 비즈니스에서 성공하려면 냉정해야 할까요?',
    summary: `많은 사람들이 비즈니스에서 성공하려면 냉정하고 비열해야 한다고 생각합니다. Paul Graham은 정반대라고 말합니다. 나쁜 사람들은 결국 실패합니다.

단기적으로는 비열하게 구는 것이 이득처럼 보일 수 있습니다. 하지만 장기적으로 보면 직원들은 떠나고, 파트너들은 등을 돌리고, 기회는 사라집니다. 반면 공정하고 친절한 사람들에게는 더 많은 기회가 찾아옵니다.

직원과 파트너를 공정하게 대하세요. 단기 이익보다 장기 신뢰가 중요합니다. 어려운 상황에서도 정직하세요. 좋은 평판은 가장 강력한 자산입니다. 다른 사람의 성공을 도와주세요. 선의는 돌고 돌아 돌아옵니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n오늘 함께 일하는 사람에게 진심 어린 감사 인사를 전해보세요. 구체적으로 무엇이 좋았는지 말해주세요.',
  },

  'Before the Startup': {
    intro: '🎯 스타트업을 시작하기 전에 반드시 알아야 할 것들',
    summary: `많은 대학생들이 "졸업하자마자 창업해야 할까?"라고 묻습니다. Paul Graham의 답은 "아니오"입니다. 지금 당장 창업하는 것보다 더 중요한 것들이 있습니다.

첫째, 폭넓게 배우세요. 스타트업은 좁은 전문 지식보다 넓은 시야를 요구합니다. 둘째, 흥미로운 사람들을 만나세요. 공동창업자는 친구 중에서 나옵니다. 셋째, 좋은 아이디어는 억지로 생각해서 나오지 않습니다. 흥미로운 문제를 탐구하다 보면 자연스럽게 발견됩니다.

가장 중요한 건 "사람들이 원하는 것을 만드는 것"입니다. 트릭이나 비법은 없습니다. 진짜 문제를 해결하는 것, 그것이 전부입니다.`,
    action: '🚀 오늘 바로 실천해볼 한 가지\n자신이 정말 흥미를 느끼는 분야를 하나 정하고, 그 분야의 최신 논문이나 글을 하나 읽어보세요.',
  },
};

function generateNewsletter(essay: AnalyzedEssay): string {
  const category = essay.analysis.primaryCategory as keyof typeof categoryIntros;
  const title = essay.title;

  // 맞춤형 Newsletter가 있으면 사용
  if (customNewsletters[title]) {
    const custom = customNewsletters[title];
    return `${custom.intro}

✨ 핵심 내용 요약

${custom.summary}

${custom.action}`;
  }

  // 기본 템플릿
  const intro = categoryIntros[category] || categoryIntros.Mindset;

  return `🎯 ${intro}

✨ 핵심 내용 요약

${essay.analysis.koreanSummary} ${essay.analysis.relevanceToKoreanContext}

**핵심 포인트**
• ${essay.analysis.keyTakeaways[0] || '첫 번째 핵심 인사이트'}
• ${essay.analysis.keyTakeaways[1] || '두 번째 핵심 인사이트'}
• ${essay.analysis.keyTakeaways[2] || '세 번째 핵심 인사이트'}

🚀 오늘 바로 실천해볼 한 가지
이 에세이의 핵심 내용 중 한 가지를 선택해 오늘 바로 적용해보세요.`;
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
  console.log('🚀 Starting newsletter-style summary update...\n');

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
      const newSummary = generateNewsletter(essay);
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
