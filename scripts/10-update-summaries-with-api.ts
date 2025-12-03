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

아래 에세이를 읽고, 뉴스레터 형식의 Summary를 작성해주세요.

### [형식 예시]
🎯 창업을 꿈꾸지 않아도, 창업자의 사고를 배워야 하는 이유

✨ 핵심 내용 요약

Paul Graham의 이 에세이는 대학생들에게 스타트업에 관한 6가지 역설적 진실을 알려줍니다. 가장 중요한 메시지는 스타트업 성공의 비결은 트릭이 아니라 "사람들이 원하는 것을 만드는 것"이며, 대학생은 지금 당장 창업하기보다 폭넓게 배우고 탐구해야 한다는 것입니다. 좋은 스타트업 아이디어는 억지로 생각해서 나오는 게 아니라, 흥미로운 문제를 탐구하고 미래의 최전선에 서다 보면 자연스럽게 발견된다는 조언으로 마무리됩니다.

**핵심 포인트**
• 사람들이 원하는 것을 만드는 것이 전부입니다
• 지금 당장 창업하기보다 폭넓게 배우세요
• 좋은 아이디어는 자연스럽게 발견됩니다

🚀 오늘 바로 실천해볼 한 가지
자신의 프로젝트를 실행할 아이디어를 떠올려 노트에 적어보세요.

### [지침]
1. 🎯 인트로: 흥미를 끄는 질문이나 핵심 메시지 (한 문장)
2. ✨ 핵심 내용 요약: 에세이의 주요 메시지를 2-3개 문단으로 요약 (400-500자)
3. **핵심 포인트**: 3가지 핵심 인사이트 (각 한 문장)
4. 🚀 실천 항목: 오늘 바로 실천할 수 있는 구체적인 행동 한 가지

### [제약사항]
- 전체 분량: 500-700자
- 친근하고 따뜻한 톤
- 불필요한 반복 금지
- 실천 가능한 구체적 조언

---

**에세이 제목**: {{TITLE}}
**카테고리**: {{CATEGORY}}

**에세이 원문**:
{{CONTENT}}

---

위 형식에 맞춰 Summary만 출력하세요. 다른 설명은 포함하지 마세요.`;

async function generateSummaryWithAPI(essay: AnalyzedEssay): Promise<string> {
  const prompt = SUMMARY_PROMPT
    .replace('{{TITLE}}', essay.title)
    .replace('{{CATEGORY}}', essay.analysis.primaryCategory)
    .replace('{{CONTENT}}', essay.content.substring(0, 12000)); // API 토큰 제한 고려

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // 빠르고 저렴한 모델 사용
      max_tokens: 1500,
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
  } catch (error: any) {
    if (error.status === 401) {
      console.error('  ❌ API 인증 오류: API 키를 확인하세요');
    }
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
  console.log(`  ✅ Summary updated (${newSummary.length} chars)`);
}

async function updateAllSummaries() {
  console.log('🚀 Starting API-based summary update...\n');
  console.log('⚠️  Note: This requires ANTHROPIC_API_KEY in .env file');
  console.log('   Estimated time: ~20-30 minutes');
  console.log('   Estimated cost: ~$2-4 USD (using Haiku model)\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in .env');
    console.error('Please add your API key to .env file:');
    console.error('ANTHROPIC_API_KEY=sk-ant-api03-...');
    process.exit(1);
  }

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
      const newSummary = await generateSummaryWithAPI(essay);
      await updateMarkdownFile(essay, newSummary);
      successCount++;

      // Rate limiting: Claude API는 초당 약 5 요청 허용
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error: any) {
      console.error(`  ❌ Error:`, error.message || error);
      errorCount++;

      // 인증 오류면 즉시 중단
      if (error.status === 401) {
        console.error('\n💥 API 인증 실패. 프로세스를 중단합니다.');
        break;
      }
    }

    // Progress report every 25 essays
    if ((i + 1) % 25 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
      const remaining = Math.round(
        (elapsed / (i + 1)) * (essays.length - i - 1)
      );
      console.log(
        `\n📊 Progress: ${i + 1}/${essays.length} | Elapsed: ${elapsed}min | Remaining: ~${remaining}min`
      );
      console.log(`   Success: ${successCount} | Errors: ${errorCount}\n`);
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log('\n✅ Summary update complete!');
  console.log(`📊 Success: ${successCount} | Errors: ${errorCount}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);
}

updateAllSummaries()
  .then(() => {
    console.log('\n✨ All summaries updated with AI-generated content!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
