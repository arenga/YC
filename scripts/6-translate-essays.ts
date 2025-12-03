import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

// Google Translate API를 사용한 번역 (무료)
// 또는 DeepL API로 교체 가능
async function translateText(text: string): Promise<string> {
  // 긴 텍스트를 청크로 나누기 (API 제한 때문)
  const maxChunkSize = 4000; // 안전한 크기
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += maxChunkSize) {
    chunks.push(text.substring(i, i + maxChunkSize));
  }

  const translations: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Translating chunk ${i + 1}/${chunks.length}...`);

    try {
      // Google Translate CLI 사용 (무료)
      // npm install -g @vitalets/google-translate-api 필요
      const chunk = chunks[i].replace(/'/g, "\\'").replace(/"/g, '\\"');

      // Python googletrans 사용 (더 안정적)
      const pythonScript = `
import sys
from googletrans import Translator

translator = Translator()
text = """${chunk}"""

try:
    result = translator.translate(text, src='en', dest='ko')
    print(result.text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;

      // Python 스크립트를 임시 파일로 저장하고 실행
      const tempFile = path.join('/tmp', `translate_${Date.now()}.py`);
      fs.writeFileSync(tempFile, pythonScript, 'utf-8');

      const { stdout } = await execAsync(`python3 ${tempFile}`);
      fs.unlinkSync(tempFile);

      translations.push(stdout.trim());

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ⚠️  Translation failed for chunk ${i + 1}:`, error);
      translations.push(`[번역 실패: ${chunks[i].substring(0, 100)}...]`);
    }
  }

  return translations.join('\n\n');
}

async function updateEssayWithTranslation(essay: AnalyzedEssay): Promise<void> {
  const { analysis } = essay;
  const categoryDir = path.join(process.cwd(), 'essays', analysis.primaryCategory, analysis.difficulty);

  const filename = essay.title
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
    .toLowerCase() + '.md';

  const filepath = path.join(categoryDir, filename);

  // 기존 파일 읽기
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️  File not found: ${filepath}`);
    return;
  }

  const existingContent = fs.readFileSync(filepath, 'utf-8');

  // 이미 번역이 있는지 확인
  if (existingContent.includes('## 한국어 번역 (Korean Translation)')) {
    console.log(`  ⏭️  Already translated, skipping...`);
    return;
  }

  // 원문 번역
  console.log(`  🔄 Translating: ${essay.title}...`);
  const translatedContent = await translateText(essay.content);

  // "원문" 섹션 바로 앞에 번역 추가
  const updatedContent = existingContent.replace(
    '## 원문 (Original Essay)',
    `## 한국어 번역 (Korean Translation)

${translatedContent}

---

## 원문 (Original Essay)`
  );

  // 파일 저장
  fs.writeFileSync(filepath, updatedContent, 'utf-8');
  console.log(`  ✅ Translation added`);
}

async function translateAllEssays() {
  console.log('🚀 Starting essay translation...\n');
  console.log('⚠️  Note: This requires Python and googletrans package');
  console.log('   Install: pip3 install googletrans==4.0.0-rc1\n');

  // Python과 googletrans 확인
  try {
    await execAsync('python3 -c "import googletrans"');
  } catch (error) {
    console.error('❌ Error: googletrans not found');
    console.error('Please install: pip3 install googletrans==4.0.0-rc1');
    process.exit(1);
  }

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(fs.readFileSync(analyzedPath, 'utf-8'));

  console.log(`📚 Loaded ${essays.length} essays\n`);
  console.log('⚠️  Translation will take a while (1-2 hours for 232 essays)');
  console.log('   You can stop anytime with Ctrl+C and resume later.\n');

  for (let i = 0; i < essays.length; i++) {
    const essay = essays[i];
    console.log(`[${i + 1}/${essays.length}] ${essay.title}`);

    try {
      await updateEssayWithTranslation(essay);
    } catch (error) {
      console.error(`  ❌ Error:`, error);
    }
  }

  console.log('\n✅ Translation complete!');
}

// Run the script
translateAllEssays()
  .then(() => {
    console.log('\n✨ All essays translated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
