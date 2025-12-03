import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUMMARY_PROMPT = `당신은 창업자, PM/PO를 위한 뉴스레터 작가입니다.

### [목표]
출근길에 간단하게 읽을 수 있도록 에세이의 핵심 메시지와 실천 팁을 쉽고 명확하게 재구성하세요.

### [페르소나]
- 예비 또는 현직 PM/PO/창업자
- 출근길에 짧고 가볍게 정보를 얻고 싶은 직장인
- 자기계발에 관심이 많고, 실천 가능한 인사이트를 선호하는 독자

### [지침]
1. 에세이의 주요 아이디어를 뉴스레터 핵심 요약/포인트로 정리합니다.
2. 각 포인트는 간결한 소제목과 1~2문장 내외의 설명으로 구성합니다.
3. 마지막에는 오늘 실천할 수 있는 한 가지 액션(실제 행동 지침)을 별도의 강조 구문으로 제시합니다.
4. 전체 분량은 500자~700자 이내로 제한합니다.
5. 마무리는 간결하고 따뜻한 어조로 작성합니다.

### [제약사항]
- 지나치게 긴 문장이나 전문 용어, 장황한 배경 설명을 피하십시오.
- 복잡한 사례나 배경 맥락은 생략하고, 실용적이고 행동 중심의 정보에 집중하십시오.
- 뉴스레터의 톤은 친근하고 긍정적이어야 하며, 부담 없이 읽히도록 구성하십시오.
- 불필요한 반복, 장황한 나열 금지
- 헤드라인, 소제목, 구분선 등으로 시각적 명확성 부여

### [작업]
아래 에세이를 읽고, 위 지침에 따라 뉴스레터 형식의 Summary를 작성하세요.
반드시 한국어로 작성하고, 500-700자 이내로 제한하세요.

**에세이 제목**: {{TITLE}}
**카테고리**: {{CATEGORY}}

**에세이 원문**:
{{CONTENT}}

**출력 형식**:
Summary만 출력하세요. 다른 설명이나 메타 정보는 포함하지 마세요.`;

async function generateNewSummary(essay: AnalyzedEssay): Promise<string> {
  const prompt = SUMMARY_PROMPT
    .replace('{{TITLE}}', essay.title)
    .replace('{{CATEGORY}}', essay.analysis.primaryCategory)
    .replace('{{CONTENT}}', essay.content.substring(0, 15000)); // API 제한 고려

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return textContent.text.trim();
  } catch (error) {
    console.error(`  ❌ API Error:`, error);
    throw error;
  }
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
  console.log(`  ✅ Summary updated`);
}

async function updateAllSummaries() {
  console.log('🚀 Starting summary update with Claude API...\n');
  console.log('⚠️  Note: This requires ANTHROPIC_API_KEY in .env file');
  console.log('   This will take ~30-60 minutes for 232 essays\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in .env');
    process.exit(1);
  }

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(
    fs.readFileSync(analyzedPath, 'utf-8')
  );

  console.log(`📚 Loaded ${essays.length} essays\n`);
  console.log('⏱️  Estimated time: ~30-60 minutes');
  console.log('💰 Estimated cost: ~$4-6 USD\n');

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    console.log(`\n[${i + 1}/${essays.length}] ${essay.title}`);

    try {
      const newSummary = await generateNewSummary(essay);
      await updateMarkdownFile(essay, newSummary);
      successCount++;

      // Rate limiting: Claude API 제한 고려
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        `\n📊 Progress: ${i + 1}/${essays.length} | Elapsed: ${elapsed}min | Remaining: ~${remaining}min`
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
