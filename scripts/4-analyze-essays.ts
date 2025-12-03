import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface Essay {
  title: string;
  url: string;
  year?: string;
  content: string;
  scrapedAt: string;
}

interface AnalyzedEssay extends Essay {
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

const CATEGORIES = [
  'Mindset',
  'Product',
  'Go-to-Market',
  'Fundraising',
  'Operations & Execution',
  'Productivity & Efficiency'
];

const ANALYSIS_PROMPT = `당신은 스타트업 및 프로덕트 매니지먼트 전문가입니다.
Paul Graham의 에세이를 분석하여 한국의 PM/PO/창업자들을 위한 교육 콘텐츠로 재구성해주세요.

다음 카테고리 중 하나로 분류해주세요 (MECE 원칙):
- **Mindset**: 창업자/PM/PO의 태도와 사고체계
- **Product**: 사용자를 위한 가치제공
- **Go-to-Market**: 고객 획득 및 확장 전략
- **Fundraising**: 외부 자본 유치/투자
- **Operations & Execution**: 제품이 시장에서 작동하도록 만드는 메커니즘
- **Productivity & Efficiency**: 개인/조직이 일하는 방식/습관/시스템

난이도 기준:
- **초급**: 기본적인 스타트업 개념, PM/PO 입문자도 이해 가능
- **중급**: 1-3년 PM/스타트업 경험자 대상, 실행 중심
- **고급**: 실리콘밸리 맥락, 깊은 전략적 사고, 3년 이상 경험 필요

다음 JSON 형식으로 응답해주세요:
{
  "primaryCategory": "카테고리명",
  "secondaryCategory": "부차적 카테고리 (선택사항)",
  "difficulty": "초급|중급|고급",
  "koreanSummary": "2-3문장으로 에세이 요약",
  "keyTakeaways": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "relevanceToKoreanContext": "한국 PM/PO에게 주는 시사점"
}`;

async function analyzeEssay(
  client: Anthropic,
  essay: Essay
): Promise<AnalyzedEssay['analysis'] | null> {
  try {
    // Truncate content if too long (Claude has token limits)
    const maxContentLength = 100000; // ~25k tokens
    const truncatedContent = essay.content.length > maxContentLength
      ? essay.content.substring(0, maxContentLength) + '... [truncated]'
      : essay.content;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `${ANALYSIS_PROMPT}

에세이 제목: ${essay.title}
출판 연도: ${essay.year || 'Unknown'}

에세이 내용:
${truncatedContent}

위 에세이를 분석하여 JSON 형식으로 응답해주세요.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      ...analysis,
      analyzedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`  ❌ Error analyzing "${essay.title}":`, error);
    return null;
  }
}

async function analyzeAllEssays(): Promise<void> {
  console.log('🚀 Starting essay analysis with Claude API...\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('❌ ANTHROPIC_API_KEY not found in environment variables. Please create a .env file.');
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Load raw essays
  const rawPath = path.join(process.cwd(), 'data', 'essays-raw.json');
  if (!fs.existsSync(rawPath)) {
    throw new Error('❌ essays-raw.json not found. Please run scripts 1-3 first.');
  }

  const essays: Essay[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
  console.log(`📚 Loaded ${essays.length} essays for analysis\n`);

  const analyzedEssays: AnalyzedEssay[] = [];
  const failedEssays: string[] = [];

  // Process essays one by one (not using Batches API for simplicity)
  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    const progress = `[${i + 1}/${essays.length}]`;

    console.log(`${progress} Analyzing: ${essay.title}`);

    const analysis = await analyzeEssay(client, essay);

    if (analysis) {
      analyzedEssays.push({
        ...essay,
        analysis
      });
      console.log(`  ✅ Category: ${analysis.primaryCategory} | Difficulty: ${analysis.difficulty}`);
    } else {
      failedEssays.push(essay.title);
      console.log(`  ⚠️  Failed to analyze`);
    }

    // Rate limiting - Claude API has rate limits
    if (i < essays.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  // Save analyzed essays
  const outputPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  fs.writeFileSync(outputPath, JSON.stringify(analyzedEssays, null, 2), 'utf-8');

  console.log(`\n✅ Analysis complete!`);
  console.log(`📊 Successfully analyzed: ${analyzedEssays.length}/${essays.length} essays`);
  console.log(`💾 Saved to: ${outputPath}`);

  if (failedEssays.length > 0) {
    console.log(`\n⚠️  Failed to analyze ${failedEssays.length} essays:`);
    failedEssays.forEach(title => console.log(`  - ${title}`));
  }

  // Category distribution
  const categoryDist = analyzedEssays.reduce((acc, essay) => {
    const cat = essay.analysis.primaryCategory;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Category Distribution:');
  Object.entries(categoryDist)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} essays`);
    });

  // Difficulty distribution
  const difficultyDist = analyzedEssays.reduce((acc, essay) => {
    const diff = essay.analysis.difficulty;
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Difficulty Distribution:');
  Object.entries(difficultyDist).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} essays`);
  });
}

// Run the script
analyzeAllEssays()
  .then(() => {
    console.log('\n✨ Essay analysis completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
