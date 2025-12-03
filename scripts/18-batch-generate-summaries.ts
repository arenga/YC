import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const SUMMARY_PROMPT = `당신은 한국의 PM, PO, 스타트업 창업자를 위한 뉴스레터 작가입니다.
Paul Graham의 에세이를 읽고 다음 형식으로 요약을 작성해주세요:

🎯 [독자의 호기심을 자극하는 질문 형식의 제목]

✨ 핵심 내용 요약

[2-3 문단으로 에세이의 핵심 내용을 요약합니다. 구체적인 예시와 함께 실용적으로 작성하세요. 400-500자 정도]

**핵심 포인트**
• [핵심 포인트 1 - 구체적이고 실용적으로]
• [핵심 포인트 2 - 구체적이고 실용적으로]
• [핵심 포인트 3 - 구체적이고 실용적으로]

🚀 오늘 바로 실천해볼 한 가지
[독자가 오늘 당장 실천할 수 있는 구체적인 행동 하나]

중요한 가이드라인:
1. 한국 독자에게 친숙한 예시와 맥락을 사용하세요
2. "~입니다", "~하세요" 같은 자연스러운 한국어 문체를 사용하세요
3. 구체적이고 실용적인 조언에 집중하세요
4. 너무 추상적이거나 철학적이지 않게 작성하세요
5. 독자가 바로 행동할 수 있는 인사이트를 제공하세요`;

async function generateSummary(essay: AnalyzedEssay): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${SUMMARY_PROMPT}

에세이 제목: ${essay.title}
카테고리: ${essay.analysis.primaryCategory}
난이도: ${essay.analysis.difficulty}

에세이 원문:
${essay.content.substring(0, 15000)}

위 에세이를 읽고 요청한 형식대로 요약을 작성해주세요. 백틱이나 코드 블록 없이 바로 요약 내용만 작성해주세요.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }

  throw new Error('Unexpected response type');
}

async function processBatch(startIndex: number, batchSize: number) {
  console.log(`\n📝 Batch ${Math.floor(startIndex / batchSize) + 1} 시작 (${startIndex + 1}-${startIndex + batchSize}번)\n`);

  const remainingPath = path.join(process.cwd(), 'data', 'remaining-essays-full.json');
  const remaining: AnalyzedEssay[] = JSON.parse(fs.readFileSync(remainingPath, 'utf-8'));

  const batch = remaining.slice(startIndex, startIndex + batchSize);
  const summaries: Record<string, string> = {};

  for (let i = 0; i < batch.length; i++) {
    const essay = batch[i];
    console.log(`[${startIndex + i + 1}/${remaining.length}] ${essay.title}`);

    try {
      const summary = await generateSummary(essay);
      summaries[essay.title] = summary;
      console.log(`  ✅ 요약 생성 완료`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`  ❌ 오류:`, error.message);
      summaries[essay.title] = `🎯 ${essay.title}

✨ 핵심 내용 요약

[요약 생성 실패]

**핵심 포인트**
• 요약 생성 중 오류 발생
• 수동으로 작성 필요
• 나중에 업데이트 예정

🚀 오늘 바로 실천해볼 한 가지
원문을 직접 읽어보세요.`;
    }
  }

  // 결과 저장
  const outputPath = path.join(
    process.cwd(),
    'data',
    `batch-summaries-${Math.floor(startIndex / batchSize) + 1}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(summaries, null, 2), 'utf-8');
  console.log(`\n💾 저장 완료: ${outputPath}`);

  return summaries;
}

async function generateAllSummaries() {
  console.log('🚀 전체 배치 요약 생성 시작...\n');
  console.log('⚠️  이 작업은 시간이 오래 걸립니다 (약 3-4시간)\n');

  const remainingPath = path.join(process.cwd(), 'data', 'remaining-essays-full.json');
  const remaining: AnalyzedEssay[] = JSON.parse(fs.readFileSync(remainingPath, 'utf-8'));

  console.log(`📚 총 ${remaining.length}개 에세이 처리 예정\n`);

  const batchSize = 20;
  const allSummaries: Record<string, string> = {};

  for (let i = 0; i < remaining.length; i += batchSize) {
    const batchSummaries = await processBatch(i, batchSize);
    Object.assign(allSummaries, batchSummaries);

    console.log(`\n✅ Batch ${Math.floor(i / batchSize) + 1} 완료`);
    console.log(`진행률: ${Math.min(i + batchSize, remaining.length)}/${remaining.length} (${Math.round((Math.min(i + batchSize, remaining.length) / remaining.length) * 100)}%)\n`);
  }

  // 전체 결과를 TypeScript 형식으로 저장
  const tsContent = `// 자동 생성된 요약 - Batch 5 이상
export const generatedSummaries: Record<string, string> = ${JSON.stringify(allSummaries, null, 2)};
`;

  const tsPath = path.join(process.cwd(), 'data', 'generated-summaries.ts');
  fs.writeFileSync(tsPath, tsContent, 'utf-8');

  console.log(`\n✅ 전체 요약 생성 완료!`);
  console.log(`📊 성공: ${Object.keys(allSummaries).length}개`);
  console.log(`💾 저장 위치: ${tsPath}`);
}

generateAllSummaries()
  .then(() => {
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 오류:', error);
    process.exit(1);
  });
