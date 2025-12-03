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

// 카테고리별 템플릿
const categoryTemplates = {
  Mindset: {
    intro: '성공하는 창업자와 PM의 핵심 사고방식을 다룹니다.',
    actionPrefix: '오늘부터 실천하기',
    closing: '작은 변화가 큰 차이를 만듭니다.',
  },
  Product: {
    intro: '사용자 중심의 제품 개발 원칙을 제시합니다.',
    actionPrefix: '오늘 바로 적용하기',
    closing: '사용자에게 진정한 가치를 전하세요.',
  },
  Fundraising: {
    intro: '성공적인 투자 유치를 위한 실전 가이드입니다.',
    actionPrefix: '투자 유치 실전 팁',
    closing: '준비된 창업자에게 기회가 찾아옵니다.',
  },
  'Operations & Execution': {
    intro: '스타트업 운영과 실행의 핵심 원칙을 담았습니다.',
    actionPrefix: '당장 실행하기',
    closing: '실행이 전략을 이깁니다.',
  },
  'Go-to-Market': {
    intro: '시장 진입과 성장 전략의 핵심을 설명합니다.',
    actionPrefix: '시장 공략 첫걸음',
    closing: '올바른 전략이 성장을 가속화합니다.',
  },
  'Productivity & Efficiency': {
    intro: '효율적인 업무 방식과 생산성 향상법을 제시합니다.',
    actionPrefix: '생산성 높이기',
    closing: '시간은 가장 소중한 자산입니다.',
  },
};

function extractKeyPoints(content: string, title: string): string[] {
  const points: string[] = [];
  const sentences = content
    .replace(/\n+/g, ' ')
    .split(/\. /)
    .filter((s) => s.length > 30);

  // 제목에서 핵심 키워드 추출
  const titleLower = title.toLowerCase();

  // 문장 중요도 분석
  const importantPhrases = [
    'important',
    'key',
    'must',
    'should',
    'critical',
    'essential',
    'fundamental',
    'always',
    'never',
    'best way',
    'the reason',
    'the problem',
    'the solution',
    'what matters',
    'secret',
  ];

  const scoredSentences = sentences
    .map((sentence) => {
      let score = 0;
      const lower = sentence.toLowerCase();

      // 중요 구문 포함 여부
      importantPhrases.forEach((phrase) => {
        if (lower.includes(phrase)) score += 2;
      });

      // 제목 키워드 포함 여부
      const titleWords = titleLower.split(' ').filter((w) => w.length > 3);
      titleWords.forEach((word) => {
        if (lower.includes(word)) score += 1;
      });

      // 문장 길이 (너무 짧거나 길지 않은 것 선호)
      if (sentence.length > 50 && sentence.length < 200) score += 1;

      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // 상위 3-5개 문장 선택
  const selectedSentences = scoredSentences.slice(0, 4).map((s) => s.sentence);

  // 간결하게 정리
  selectedSentences.forEach((sentence, idx) => {
    if (idx < 3) {
      const cleaned = sentence
        .trim()
        .substring(0, 150)
        .replace(/\s+/g, ' ');
      if (cleaned.length > 20) {
        points.push(cleaned);
      }
    }
  });

  return points;
}

function generateActionItem(
  content: string,
  category: string,
  title: string
): string {
  const actionKeywords = [
    'start',
    'do',
    'try',
    'practice',
    'write',
    'ask',
    'build',
    'focus',
    'avoid',
    'remember',
    'keep',
    'make',
  ];

  const sentences = content
    .replace(/\n+/g, ' ')
    .split(/\. /)
    .filter((s) => s.length > 20 && s.length < 200);

  // Action-oriented 문장 찾기
  const actionSentences = sentences.filter((s) => {
    const lower = s.toLowerCase();
    return actionKeywords.some((keyword) => lower.includes(keyword));
  });

  if (actionSentences.length > 0) {
    const action = actionSentences[0].trim().substring(0, 120);
    return action;
  }

  // 카테고리별 기본 액션
  const defaultActions: Record<string, string> = {
    Mindset:
      '오늘 하루 내 사고방식을 점검하고, 한 가지 개선점을 찾아보세요',
    Product: '사용자 한 명과 대화하고 그들의 진짜 문제를 파악하세요',
    Fundraising: '투자 덱의 첫 페이지를 다시 검토하고 핵심 메시지를 명확히 하세요',
    'Operations & Execution': '오늘 미뤄둔 중요한 일 한 가지를 바로 실행하세요',
    'Go-to-Market': '우리 제품의 핵심 가치를 한 문장으로 정리해보세요',
    'Productivity & Efficiency':
      '오늘 가장 중요한 일 3가지를 선정하고 집중하세요',
  };

  return defaultActions[category] || '오늘 배운 내용을 한 가지 실천해보세요';
}

function generateNewsletter(essay: AnalyzedEssay): string {
  const category = essay.analysis.primaryCategory;
  const template = categoryTemplates[category as keyof typeof categoryTemplates];

  // 핵심 포인트 추출
  const keyPoints = extractKeyPoints(essay.content, essay.title);

  // 액션 아이템 생성
  const actionItem = generateActionItem(
    essay.content,
    category,
    essay.title
  );

  // 뉴스레터 구성
  const sections: string[] = [];

  // 인트로
  sections.push(`**${template.intro}**\n`);

  // 핵심 포인트
  keyPoints.forEach((point, idx) => {
    const heading = `**${idx + 1}. 핵심 인사이트**`;
    const content = point.endsWith('.')
      ? point
      : point + '.';
    sections.push(`${heading}\n${content}\n`);
  });

  // 실천 팁
  sections.push(`---\n`);
  sections.push(`**💡 ${template.actionPrefix}**\n`);
  sections.push(`${actionItem}\n`);

  // 마무리
  sections.push(`${template.closing}`);

  return sections.join('\n');
}

function ensureLength(text: string, minLen: number, maxLen: number): string {
  if (text.length < minLen) {
    // 너무 짧으면 조금 더 설명 추가
    return text + '\n\n이 에세이는 실전에서 바로 적용할 수 있는 구체적인 인사이트를 제공합니다.';
  }
  if (text.length > maxLen) {
    // 너무 길면 자르기
    return text.substring(0, maxLen - 3) + '...';
  }
  return text;
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
  console.log('🚀 Starting rule-based summary update...\n');
  console.log('⚠️  Note: Using rule-based text analysis (no API required)');
  console.log('   Estimated time: ~5-10 minutes\n');

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
      let newSummary = generateNewsletter(essay);

      // 길이 조정 (500-700자)
      newSummary = ensureLength(newSummary, 500, 700);

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
