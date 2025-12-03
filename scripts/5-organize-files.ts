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
    secondaryCategory?: string;
    difficulty: '초급' | '중급' | '고급';
    koreanSummary: string;
    keyTakeaways: string[];
    relevanceToKoreanContext: string;
    analyzedAt: string;
  };
}

interface CategoryIndex {
  category: string;
  difficulty: string;
  essays: {
    title: string;
    filename: string;
    year?: string;
  }[];
}

function sanitizeFilename(title: string): string {
  // Remove special characters and limit length
  return title
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
    .toLowerCase();
}

function createEssayMarkdown(essay: AnalyzedEssay): string {
  const { analysis } = essay;

  return `# ${essay.title}

**카테고리**: ${analysis.primaryCategory}${analysis.secondaryCategory ? ` (부차: ${analysis.secondaryCategory})` : ''}
**난이도**: ${analysis.difficulty}
**출판일**: ${essay.year || 'N/A'}
**원문**: ${essay.url}

---

## 요약 (Summary)

${analysis.koreanSummary}

---

## 핵심 포인트 (Key Takeaways)

${analysis.keyTakeaways.map((point, i) => `${i + 1}. ${point}`).join('\n')}

---

## 한국 PM/PO 적용 시사점

${analysis.relevanceToKoreanContext}

---

## 원문 (Original Essay)

${essay.content}

---

_분석일: ${new Date(analysis.analyzedAt).toLocaleDateString('ko-KR')}_
_수집일: ${new Date(essay.scrapedAt).toLocaleDateString('ko-KR')}_
`;
}

function organizeEssays(): void {
  console.log('🚀 Starting essay organization...\n');

  // Load analyzed essays
  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  if (!fs.existsSync(analyzedPath)) {
    throw new Error('❌ essays-analyzed.json not found. Please run script 4 first.');
  }

  const essays: AnalyzedEssay[] = JSON.parse(fs.readFileSync(analyzedPath, 'utf-8'));
  console.log(`📚 Loaded ${essays.length} analyzed essays\n`);

  const essaysDir = path.join(process.cwd(), 'essays');
  const categoryIndexes: CategoryIndex[] = [];

  let fileCount = 0;

  // Organize essays by category and difficulty
  essays.forEach((essay, index) => {
    const { primaryCategory, difficulty } = essay.analysis;

    const categoryDir = path.join(essaysDir, primaryCategory, difficulty);

    // Ensure directory exists
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Create filename
    const filename = `${sanitizeFilename(essay.title)}.md`;
    const filepath = path.join(categoryDir, filename);

    // Generate markdown content
    const markdown = createEssayMarkdown(essay);

    // Write file
    fs.writeFileSync(filepath, markdown, 'utf-8');

    console.log(`[${index + 1}/${essays.length}] ${primaryCategory}/${difficulty}/${filename}`);
    fileCount++;

    // Track for index
    const indexKey = `${primaryCategory}-${difficulty}`;
    let categoryIndex = categoryIndexes.find(ci => ci.category === primaryCategory && ci.difficulty === difficulty);

    if (!categoryIndex) {
      categoryIndex = {
        category: primaryCategory,
        difficulty,
        essays: []
      };
      categoryIndexes.push(categoryIndex);
    }

    categoryIndex.essays.push({
      title: essay.title,
      filename,
      year: essay.year
    });
  });

  console.log(`\n✅ Created ${fileCount} essay files\n`);

  // Create category indexes
  console.log('📑 Creating category indexes...\n');

  const categories = [...new Set(essays.map(e => e.analysis.primaryCategory))];

  categories.forEach(category => {
    const categoryDir = path.join(essaysDir, category);
    const categoryEssays = essays.filter(e => e.analysis.primaryCategory === category);

    const indexContent = `# ${category}

총 ${categoryEssays.length}개의 에세이

## 난이도별 분류

${['초급', '중급', '고급'].map(diff => {
      const difficultyEssays = categoryEssays.filter(e => e.analysis.difficulty === diff);
      if (difficultyEssays.length === 0) return '';

      return `### ${diff} (${difficultyEssays.length}개)

${difficultyEssays
  .sort((a, b) => (a.year || '0000').localeCompare(b.year || '0000'))
  .map(e => `- [${e.title}](${diff}/${sanitizeFilename(e.title)}.md)${e.year ? ` (${e.year})` : ''}`)
  .join('\n')}
`;
    }).filter(Boolean).join('\n')}
`;

    const indexPath = path.join(categoryDir, 'README.md');
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    console.log(`  ✅ ${category}/README.md`);
  });

  // Create master README
  console.log('\n📖 Creating master README...\n');

  const masterReadme = `# Paul Graham Essays - 한국 PM/PO/창업자 교육 콘텐츠

Paul Graham의 ${essays.length}개 에세이를 분석하고 한국의 프로덕트 매니저, 프로덕트 오너, 창업자를 위한 교육 콘텐츠로 재구성했습니다.

## 카테고리 (MECE)

${categories.map(category => {
    const count = essays.filter(e => e.analysis.primaryCategory === category).length;
    const categoryKorean = {
      'Mindset': '창업자/PM/PO의 태도와 사고체계',
      'Product': '사용자를 위한 가치제공',
      'Go-to-Market': '고객 획득 및 확장 전략',
      'Fundraising': '외부 자본 유치/투자',
      'Operations & Execution': '제품이 시장에서 작동하도록 만드는 메커니즘',
      'Productivity & Efficiency': '개인/조직이 일하는 방식/습관/시스템'
    }[category] || category;

    return `### [${category}](essays/${category}/README.md) (${count}개)
${categoryKorean}
`;
  }).join('\n')}

## 난이도별 분류

${['초급', '중급', '고급'].map(diff => {
    const count = essays.filter(e => e.analysis.difficulty === diff).length;
    const description = {
      '초급': '기본적인 스타트업 개념, PM/PO 입문자도 이해 가능',
      '중급': '1-3년 PM/스타트업 경험자 대상, 실행 중심',
      '고급': '실리콘밸리 맥락, 깊은 전략적 사고, 3년 이상 경험 필요'
    }[diff];

    return `- **${diff}** (${count}개): ${description}`;
  }).join('\n')}

## 전체 목록

[📊 전체 에세이 목록 보기](SUMMARY.md)

---

_생성일: ${new Date().toLocaleDateString('ko-KR')}_
_총 ${essays.length}개의 에세이_
`;

  fs.writeFileSync(path.join(process.cwd(), 'README.md'), masterReadme, 'utf-8');
  console.log('  ✅ README.md');

  // Create SUMMARY table
  console.log('\n📊 Creating summary table...\n');

  const summaryTable = `# 전체 에세이 목록

| 제목 (Title) | 카테고리 | 난이도 | 출판년도 | 링크 |
|-------------|---------|--------|---------|------|
${essays
  .sort((a, b) => (b.year || '0000').localeCompare(a.year || '0000'))
  .map(e => {
    const filename = `essays/${e.analysis.primaryCategory}/${e.analysis.difficulty}/${sanitizeFilename(e.title)}.md`;
    return `| ${e.title} | ${e.analysis.primaryCategory} | ${e.analysis.difficulty} | ${e.year || 'N/A'} | [보기](${filename}) |`;
  })
  .join('\n')}

---

_총 ${essays.length}개의 에세이_
`;

  fs.writeFileSync(path.join(process.cwd(), 'SUMMARY.md'), summaryTable, 'utf-8');
  console.log('  ✅ SUMMARY.md');

  // Statistics
  console.log('\n📈 Organization Statistics:');
  console.log(`  Total files created: ${fileCount}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Indexes created: ${categories.length + 2}`); // category indexes + README + SUMMARY

  console.log('\n📂 Directory Structure:');
  console.log('  YC/');
  console.log('  ├── README.md (master index)');
  console.log('  ├── SUMMARY.md (complete table)');
  console.log('  └── essays/');
  categories.forEach((cat, i) => {
    const isLast = i === categories.length - 1;
    const count = essays.filter(e => e.analysis.primaryCategory === cat).length;
    console.log(`      ${isLast ? '└' : '├'}── ${cat}/ (${count} essays)`);
    console.log(`      ${isLast ? ' ' : '│'}   ├── 초급/`);
    console.log(`      ${isLast ? ' ' : '│'}   ├── 중급/`);
    console.log(`      ${isLast ? ' ' : '│'}   ├── 고급/`);
    console.log(`      ${isLast ? ' ' : '│'}   └── README.md`);
  });
}

// Run the script
try {
  organizeEssays();
  console.log('\n✨ Essay organization completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
}
