const fs = require('fs');
const path = require('path');

// 제목 기반 카테고리 및 난이도 자동 분류 룰
const categoryRules = {
  'Fundraising': ['raise money', 'investor', 'funding', 'vc', 'venture capital', 'angel investor', 'fundraising'],
  'Product': ['startup ideas', 'product', 'users', 'make', 'build', 'scale', 'growth', 'customer'],
  'Go-to-Market': ['growth', 'marketing', 'hubs', 'silicon valley', 'market', 'expansion'],
  'Operations & Execution': ['startup', 'founder', 'execute', 'die', 'kill', 'mistakes', 'lessons', 'how not to', 'operations'],
  'Mindset': ['think', 'work hard', 'great work', 'philosophy', 'wisdom', 'procrastination', 'determination', 'stubborn', 'mindset'],
  'Productivity & Efficiency': ['schedule', 'productivity', 'time', 'efficiency', 'work', 'todo']
};

function categorizeByTitle(title) {
  const lowerTitle = title.toLowerCase();

  // Fundraising 관련
  if (lowerTitle.includes('money') || lowerTitle.includes('fund') || lowerTitle.includes('investor') ||
      lowerTitle.includes('raise') || lowerTitle.includes('vc') || lowerTitle.includes('angel')) {
    return 'Fundraising';
  }

  // Product 관련
  if (lowerTitle.includes('idea') || lowerTitle.includes('product') || lowerTitle.includes('user') ||
      lowerTitle.includes('build') || lowerTitle.includes('scale') || lowerTitle.includes('make')) {
    return 'Product';
  }

  // Operations 관련
  if (lowerTitle.includes('startup') || lowerTitle.includes('founder') || lowerTitle.includes('mistake') ||
      lowerTitle.includes('die') || lowerTitle.includes('kill') || lowerTitle.includes('fail')) {
    return 'Operations & Execution';
  }

  // Go-to-Market 관련
  if (lowerTitle.includes('growth') || lowerTitle.includes('hub') || lowerTitle.includes('valley') ||
      lowerTitle.includes('market')) {
    return 'Go-to-Market';
  }

  // Productivity 관련
  if (lowerTitle.includes('time') || lowerTitle.includes('schedule') || lowerTitle.includes('productivity') ||
      lowerTitle.includes('todo') || lowerTitle.includes('procrastination')) {
    return 'Productivity & Efficiency';
  }

  // 기본값은 Mindset
  return 'Mindset';
}

function assignDifficulty(title, category) {
  const lowerTitle = title.toLowerCase();

  // 기초/가이드/초보자 대상
  if (lowerTitle.includes('how to') || lowerTitle.includes('guide') || lowerTitle.includes('basics') ||
      lowerTitle.includes('start')) {
    return '초급';
  }

  // 고급 개념/철학/이론
  if (lowerTitle.includes('theory') || lowerTitle.includes('philosophy') || lowerTitle.includes('paradox') ||
      lowerTitle.includes('great work') || lowerTitle.includes('wisdom')) {
    return '고급';
  }

  // 기본값은 중급
  return '중급';
}

function generateAnalysis(essay) {
  const category = categorizeByTitle(essay.title);
  const difficulty = assignDifficulty(essay.title, category);

  // 제목 기반 한국어 요약 생성
  let koreanSummary = '';
  let keyTakeaways = [];
  let relevanceToKoreanContext = '';

  // 카테고리별 기본 템플릿
  const templates = {
    'Mindset': {
      summary: '창업자와 PM의 사고방식과 태도에 관한 인사이트를 제공합니다.',
      takeaways: [
        '올바른 사고방식의 중요성',
        '장기적 관점에서의 의사결정',
        '진정성 있는 접근의 가치'
      ],
      context: '한국의 빠른 성과 중심 문화에서 장기적 사고와 진정성의 중요성을 일깨웁니다.'
    },
    'Product': {
      summary: '사용자 중심의 제품 개발과 문제 해결에 대한 실용적인 조언을 담고 있습니다.',
      takeaways: [
        '사용자 문제에서 출발하라',
        '빠른 반복과 피드백',
        '본질에 집중하라'
      ],
      context: '한국 PM들이 기능 중심에서 벗어나 진정한 사용자 가치 창출에 집중하도록 돕습니다.'
    },
    'Fundraising': {
      summary: '스타트업 투자 유치와 투자자 관계에 대한 실전 가이드입니다.',
      takeaways: [
        '투자자 설득의 핵심',
        '펀딩 타이밍과 전략',
        '투자 후 관계 관리'
      ],
      context: '한국 스타트업 생태계에서 효과적인 투자 유치 전략을 제시합니다.'
    },
    'Operations & Execution': {
      summary: '스타트업 운영과 실행에서의 핵심 원칙과 흔한 실수들을 다룹니다.',
      takeaways: [
        '빠른 실행의 중요성',
        '흔한 실패 패턴 회피',
        '지속 가능한 운영 체계'
      ],
      context: '한국 스타트업이 겪는 실행 단계의 어려움에 대한 실용적 해법을 제공합니다.'
    },
    'Go-to-Market': {
      summary: '시장 진입과 고객 확보, 성장 전략에 대한 인사이트를 제공합니다.',
      takeaways: [
        '초기 시장 진입 전략',
        '확장 가능한 성장 모델',
        '생태계 활용 방법'
      ],
      context: '한국 시장 특성을 고려한 글로벌 Go-to-Market 전략의 적용법을 제시합니다.'
    },
    'Productivity & Efficiency': {
      summary: '개인과 팀의 생산성을 높이는 방법과 효율적인 일하는 방식을 설명합니다.',
      takeaways: [
        '시간 관리의 핵심',
        '집중력 유지 방법',
        '효율적인 업무 시스템'
      ],
      context: '한국의 장시간 근무 문화에서 실질적 생산성을 높이는 방법을 제시합니다.'
    }
  };

  const template = templates[category];
  koreanSummary = `"${essay.title}"은 ${template.summary}`;
  keyTakeaways = template.takeaways;
  relevanceToKoreanContext = template.context;

  return {
    primaryCategory: category,
    difficulty: difficulty,
    koreanSummary: koreanSummary,
    keyTakeaways: keyTakeaways,
    relevanceToKoreanContext: relevanceToKoreanContext,
    analyzedAt: new Date().toISOString()
  };
}

// 메인 실행
console.log('🚀 Starting full essay analysis...\n');

const rawPath = path.join(process.cwd(), 'data', 'essays-raw.json');
const essays = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

console.log(`📚 Loaded ${essays.length} essays\n`);

const analyzedEssays = essays.map((essay, index) => {
  if ((index + 1) % 50 === 0) {
    console.log(`[${index + 1}/${essays.length}] Processing...`);
  }

  return {
    ...essay,
    analysis: generateAnalysis(essay)
  };
});

const outputPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
fs.writeFileSync(outputPath, JSON.stringify(analyzedEssays, null, 2), 'utf-8');

console.log(`\n✅ Analysis complete!`);
console.log(`📊 Successfully analyzed: ${analyzedEssays.length} essays`);
console.log(`💾 Saved to: ${outputPath}`);

// 통계 출력
const stats = {
  byCategory: {},
  byDifficulty: {}
};

analyzedEssays.forEach(essay => {
  const cat = essay.analysis.primaryCategory;
  const diff = essay.analysis.difficulty;

  stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
});

console.log('\n📊 Category Distribution:');
Object.entries(stats.byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} essays`);
});

console.log('\n📊 Difficulty Distribution:');
Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
  console.log(`  ${diff}: ${count} essays`);
});
