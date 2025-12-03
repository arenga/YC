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

// 배치 처리 상태 저장
interface BatchState {
  processedCount: number;
  totalCount: number;
  currentIndex: number;
  lastProcessedTitle: string;
  errors: Array<{ index: number; title: string; error: string }>;
}

const STATE_FILE = path.join(process.cwd(), 'data', 'batch-state.json');

function loadState(): BatchState {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    processedCount: 0,
    totalCount: 0,
    currentIndex: 0,
    lastProcessedTitle: '',
    errors: [],
  };
}

function saveState(state: BatchState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
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
    throw new Error(`File not found: ${filepath}`);
  }

  const content = fs.readFileSync(filepath, 'utf-8');

  // Summary 섹션을 새로운 내용으로 교체
  const summaryRegex = /## 요약 \(Summary\)\n\n[\s\S]*?\n\n---/;
  const newSummarySection = `## 요약 (Summary)\n\n${newSummary}\n\n---`;

  const updatedContent = content.replace(summaryRegex, newSummarySection);

  fs.writeFileSync(filepath, updatedContent, 'utf-8');
}

async function processBatch() {
  console.log('🤖 Claude Code 배치 처리 시작...\n');
  console.log('📝 각 에세이를 직접 분석하여 뉴스레터 형식의 Summary를 생성합니다.\n');

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(
    fs.readFileSync(analyzedPath, 'utf-8')
  );

  const state = loadState();
  state.totalCount = essays.length;

  console.log(`📚 총 ${essays.length}개 에세이 로드 완료`);
  console.log(`✅ 이미 처리된 에세이: ${state.processedCount}개`);
  console.log(`⏳ 남은 에세이: ${essays.length - state.processedCount}개\n`);

  // 현재 인덱스부터 처리
  const startIndex = state.currentIndex;

  console.log(`\n🚀 인덱스 ${startIndex}부터 처리를 시작합니다.\n`);
  console.log(`현재 에세이: ${essays[startIndex]?.title || 'N/A'}\n`);
  console.log(`---\n`);
  console.log(`이제 Claude Code가 각 에세이를 직접 읽고 분석합니다.`);
  console.log(`생성된 Summary는 자동으로 마크다운 파일에 업데이트됩니다.\n`);

  // 상태 저장
  saveState(state);

  console.log('✨ 준비 완료! 이제 배치 처리를 진행합니다.\n');
}

processBatch()
  .then(() => {
    console.log('\n✅ 배치 처리 스크립트 준비 완료!');
  })
  .catch((error) => {
    console.error('\n💥 오류:', error);
    process.exit(1);
  });
