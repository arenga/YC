import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 짧은 에세이 하나만 테스트로 번역
async function translateSample() {
  console.log('🚀 Testing translation with one essay...\n');

  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays = JSON.parse(fs.readFileSync(analyzedPath, 'utf-8'));

  // 짧은 에세이 찾기 (Founder Mode)
  const testEssay = essays.find((e: any) => e.title === 'Founder Mode');

  if (!testEssay) {
    console.error('Test essay not found');
    return;
  }

  console.log(`📝 Translating: ${testEssay.title}`);
  console.log(`   Length: ${testEssay.content.length} characters\n`);

  // 번역 테스트
  const text = testEssay.content.substring(0, 1000); // 처음 1000자만

  const pythonScript = `
import sys
from googletrans import Translator

translator = Translator()
text = """${text.replace(/"/g, '\\"')}"""

try:
    result = translator.translate(text, src='en', dest='ko')
    print(result.text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
`;

  const tempFile = '/tmp/translate_test.py';
  fs.writeFileSync(tempFile, pythonScript, 'utf-8');

  try {
    const { stdout } = await execAsync(`python3 ${tempFile}`);
    console.log('✅ Translation successful!\n');
    console.log('Sample translation:');
    console.log('---');
    console.log(stdout.substring(0, 500));
    console.log('---\n');
    console.log('✨ Translation is working! You can now run: npm run 6:translate');
    console.log('⚠️  Note: This will take 1-2 hours for 232 essays');
  } catch (error) {
    console.error('❌ Translation failed:', error);
  } finally {
    fs.unlinkSync(tempFile);
  }
}

translateSample();
