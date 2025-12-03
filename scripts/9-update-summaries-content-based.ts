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

// 카테고리별 인트로
const categoryIntros = {
  Mindset: '창업을 꿈꾸지 않아도, 창업자의 사고를 배워야 하는 이유',
  Product: '좋은 제품은 트릭이 아니라 진짜 문제 해결에서 나옵니다',
  Fundraising: '투자는 숫자 게임이 아니라 신뢰 구축입니다',
  'Operations & Execution': '실행력이 전략을 이깁니다',
  'Go-to-Market': '시장은 만드는 것이지 찾는 것이 아닙니다',
  'Productivity & Efficiency': '시간을 쓰는 방식이 성과를 결정합니다',
};

// 원문에서 핵심 문장 추출
function extractKeyInsights(content: string, title: string): string[] {
  const sentences = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/\. /)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 300);

  // 중요 키워드
  const importantKeywords = [
    'important', 'key', 'secret', 'best way', 'most', 'always', 'never',
    'should', 'must', 'need to', 'have to', 'critical', 'essential',
    'the reason', 'the problem', 'the solution', 'what matters',
    'the trick', 'the way', 'why', 'how to', 'you need', 'you should',
    'mistake', 'wrong', 'right', 'better', 'worse', 'good', 'bad',
    'successful', 'fail', 'succeed', 'growth', 'users', 'startup',
  ];

  const titleWords = title.toLowerCase().split(' ').filter(w => w.length > 3);

  // 문장 점수 계산
  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const lower = sentence.toLowerCase();

    // 중요 키워드 포함
    importantKeywords.forEach(keyword => {
      if (lower.includes(keyword)) score += 3;
    });

    // 제목 키워드 포함
    titleWords.forEach(word => {
      if (lower.includes(word)) score += 2;
    });

    // 문장 위치 (앞부분 문장 선호)
    const position = sentences.indexOf(sentence);
    if (position < sentences.length * 0.2) score += 2;
    if (position < sentences.length * 0.4) score += 1;

    // 숫자나 리스트 형식 선호
    if (/\d+/.test(sentence)) score += 1;
    if (lower.includes('first') || lower.includes('second') || lower.includes('third')) score += 2;

    return { sentence, score };
  });

  // 상위 5개 문장 선택
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.sentence);
}

// 액션 아이템 생성
function generateActionItem(content: string, title: string, category: string): string {
  const actionKeywords = [
    'start', 'do', 'try', 'practice', 'write', 'ask', 'build', 'focus',
    'avoid', 'stop', 'begin', 'create', 'make', 'find', 'look for',
    'talk to', 'think about', 'consider', 'remember',
  ];

  const sentences = content
    .replace(/\n+/g, ' ')
    .split(/\. /)
    .filter(s => s.length > 20 && s.length < 150);

  // 액션 문장 찾기
  const actionSentences = sentences.filter(s => {
    const lower = s.toLowerCase();
    return actionKeywords.some(keyword => lower.includes(keyword));
  });

  if (actionSentences.length > 0) {
    const action = actionSentences[0]
      .trim()
      .replace(/^(So |And |But |Or |If |When |After )/i, '')
      .substring(0, 120);

    if (action.length > 20) {
      return `${action}을(를) 실천해보세요.`;
    }
  }

  // 카테고리별 기본 액션
  const defaultActions: Record<string, string> = {
    Mindset: '오늘 하루 자신의 사고방식을 점검하고, 한 가지 개선점을 찾아보세요.',
    Product: '사용자 한 명과 대화하고 그들의 진짜 문제를 파악하세요.',
    Fundraising: '투자 덱의 핵심 메시지를 한 문장으로 정리해보세요.',
    'Operations & Execution': '오늘 미뤄둔 중요한 일 한 가지를 바로 실행하세요.',
    'Go-to-Market': '우리 제품의 핵심 가치를 한 문장으로 정리해보세요.',
    'Productivity & Efficiency': '오늘 가장 중요한 일 3가지를 선정하고 집중하세요.',
  };

  return defaultActions[category] || '이 에세이의 핵심 내용을 하나 선택해 오늘 바로 적용해보세요.';
}

// 내용 요약 생성
function generateContentSummary(insights: string[], title: string): string {
  if (insights.length === 0) {
    return `Paul Graham의 "${title}" 에세이는 스타트업과 비즈니스의 핵심 원칙을 다룹니다.`;
  }

  // 첫 문장을 인트로로 사용
  const intro = insights[0].substring(0, 200);

  // 나머지 문장들로 본문 구성
  const body = insights.slice(1, 3).map(s => {
    const cleaned = s
      .replace(/\s+/g, ' ')
      .substring(0, 150);
    return cleaned;
  }).join(' ');

  return `${intro} ${body}`.trim();
}

function generateNewsletter(essay: AnalyzedEssay): string {
  const category = essay.analysis.primaryCategory as keyof typeof categoryIntros;
  const intro = categoryIntros[category] || categoryIntros.Mindset;

  // 원문에서 핵심 인사이트 추출
  const insights = extractKeyInsights(essay.content, essay.title);

  // 내용 요약 생성
  const contentSummary = generateContentSummary(insights, essay.title);

  // 액션 아이템 생성
  const actionItem = generateActionItem(essay.content, essay.title, category);

  // 핵심 포인트 (기존 분석 데이터 활용)
  const keyPoints = essay.analysis.keyTakeaways.slice(0, 3);

  return `🎯 ${intro}

✨ 핵심 내용 요약

Paul Graham의 "${essay.title}" 에세이는 ${contentSummary}

**핵심 포인트**
• ${keyPoints[0] || '첫 번째 핵심 인사이트'}
• ${keyPoints[1] || '두 번째 핵심 인사이트'}
• ${keyPoints[2] || '세 번째 핵심 인사이트'}

🚀 오늘 바로 실천해볼 한 가지
${actionItem}`;
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
  console.log('🚀 Starting content-based summary update...\n');
  console.log('📝 Extracting insights from original essay content\n');

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
    console.log('\n✨ All summaries updated with content-based insights!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
