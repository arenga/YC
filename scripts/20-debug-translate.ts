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

async function translateText(text: string): Promise<string> {
  const maxChunkSize = 4000;
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += maxChunkSize) {
    chunks.push(text.substring(i, i + maxChunkSize));
  }

  const translations: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Translating chunk ${i + 1}/${chunks.length}...`);

    try {
      const chunk = chunks[i].replace(/'/g, "\\'").replace(/"/g, '\\"');

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

      const tempFile = path.join('/tmp', `translate_${Date.now()}.py`);
      fs.writeFileSync(tempFile, pythonScript, 'utf-8');

      const { stdout } = await execAsync(`python3 ${tempFile}`);
      fs.unlinkSync(tempFile);

      translations.push(stdout.trim());

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ⚠️  Translation failed for chunk ${i + 1}:`, error);
      translations.push(`[번역 실패: ${chunks[i].substring(0, 100)}...]`);
    }
  }

  return translations.join('\n\n');
}

async function debugTranslateHeresy() {
  console.log('🔍 Debug: Translating Heresy...\n');

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(fs.readFileSync(analyzedPath, 'utf-8'));

  const heresy = essays.find(e => e.title === 'Heresy');
  if (!heresy) {
    console.error('❌ Heresy not found!');
    return;
  }

  console.log(`✅ Found essay: ${heresy.title}`);
  console.log(`📝 Category: ${heresy.analysis.primaryCategory}/${heresy.analysis.difficulty}`);

  const categoryDir = path.join(
    process.cwd(),
    'essays',
    heresy.analysis.primaryCategory,
    heresy.analysis.difficulty
  );

  const filename =
    heresy.title
      .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
      .toLowerCase() + '.md';

  const filepath = path.join(categoryDir, filename);

  console.log(`📂 File path: ${filepath}`);
  console.log(`📄 File exists: ${fs.existsSync(filepath)}`);

  if (!fs.existsSync(filepath)) {
    console.error('❌ File not found!');
    return;
  }

  const existingContent = fs.readFileSync(filepath, 'utf-8');
  console.log(`📏 File size: ${existingContent.length} characters`);

  const hasTranslation = existingContent.includes('## 한국어 번역 (Korean Translation)');
  console.log(`🔍 Has translation: ${hasTranslation}`);

  if (hasTranslation) {
    console.log('⏭️  Already translated, skipping...');
    return;
  }

  const hasOriginalMarker = existingContent.includes('## 원문 (Original Essay)');
  console.log(`🔍 Has original marker: ${hasOriginalMarker}`);

  if (!hasOriginalMarker) {
    console.error('❌ Original marker not found!');
    return;
  }

  console.log(`\n🔄 Starting translation...`);
  console.log(`📝 Content length: ${heresy.content.length} characters\n`);

  const translatedContent = await translateText(heresy.content);

  console.log(`\n✅ Translation complete`);
  console.log(`📏 Translated length: ${translatedContent.length} characters`);

  const updatedContent = existingContent.replace(
    '## 원문 (Original Essay)',
    `## 한국어 번역 (Korean Translation)

${translatedContent}

---

## 원문 (Original Essay)`
  );

  console.log(`\n📏 Updated content length: ${updatedContent.length} characters`);
  console.log(`📝 Writing file...`);

  fs.writeFileSync(filepath, updatedContent, 'utf-8');

  console.log(`✅ File written successfully!`);

  // Verify
  const verifyContent = fs.readFileSync(filepath, 'utf-8');
  const hasTranslationNow = verifyContent.includes('## 한국어 번역 (Korean Translation)');
  console.log(`\n🔍 Verification - Has translation now: ${hasTranslationNow}`);
}

debugTranslateHeresy()
  .then(() => {
    console.log('\n✨ Debug complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
