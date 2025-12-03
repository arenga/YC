import * as fs from 'fs';
import * as path from 'path';

interface AnalyzedEssay {
  title: string;
  url: string;
  year?: string;
  content: string;
  scrapedAt: string;
  koreanTranslation?: string;
  analysis: {
    primaryCategory: string;
    difficulty: string;
    koreanSummary: string;
    keyTakeaways: string[];
    relevanceToKoreanContext: string;
    analyzedAt: string;
  };
}

async function restoreKoreanTranslation(
  essay: AnalyzedEssay
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

  // 한국어 번역이 이미 있는지 확인
  if (content.includes('## 한국어 번역')) {
    return; // 이미 있으면 스킵
  }

  // 한국어 번역 섹션을 Summary와 Original 사이에 삽입
  const koreanTranslation = essay.koreanTranslation || '';

  if (!koreanTranslation) {
    console.log(`  ⚠️  No Korean translation for: ${essay.title}`);
    return;
  }

  // Summary 섹션 끝(---) 다음에 한국어 번역 섹션 추가
  const updatedContent = content.replace(
    /(## 요약 \(Summary\)[\s\S]*?\n\n---)\n\n(## 원문 \(Original)/,
    `$1\n\n## 한국어 번역 (Korean Translation)\n\n${koreanTranslation}\n\n---\n\n$2`
  );

  fs.writeFileSync(filepath, updatedContent, 'utf-8');
}

async function restoreAllTranslations() {
  console.log('🔄 한국어 번역 섹션 복원 시작...\n');

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(
    fs.readFileSync(analyzedPath, 'utf-8')
  );

  console.log(`📚 ${essays.length}개 에세이 로드 완료\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];

    if ((i + 1) % 50 === 0) {
      console.log(`[${i + 1}/${essays.length}] 처리 중...`);
    }

    try {
      if (essay.koreanTranslation) {
        await restoreKoreanTranslation(essay);
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${essay.title}`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ 복원 완료!`);
  console.log(`📊 성공: ${successCount} | 스킵: ${skipCount} | 오류: ${errorCount}`);
}

restoreAllTranslations()
  .then(() => {
    console.log('\n✨ 한국어 번역 섹션 복원 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
