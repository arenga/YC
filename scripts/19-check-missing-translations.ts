import * as fs from 'fs';
import * as path from 'path';

function findAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function checkForKoreanTranslation(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes('## 한국어 번역');
}

async function checkMissingTranslations() {
  console.log('🔍 한국어 번역 누락 체크 시작...\n');

  const essaysDir = path.join(process.cwd(), 'essays');
  const allFiles = findAllMarkdownFiles(essaysDir);

  console.log(`📚 총 ${allFiles.length}개 파일 발견\n`);

  const missingTranslations: string[] = [];

  for (const file of allFiles) {
    if (!checkForKoreanTranslation(file)) {
      missingTranslations.push(file);
    }
  }

  if (missingTranslations.length === 0) {
    console.log('✅ 모든 파일에 한국어 번역이 있습니다!');
  } else {
    console.log(`❌ ${missingTranslations.length}개 파일에 한국어 번역이 누락되었습니다:\n`);

    missingTranslations.forEach((file, index) => {
      const relativePath = file.replace(process.cwd() + '/', '');
      console.log(`${index + 1}. ${relativePath}`);
    });

    // Save to file for reference
    const outputPath = path.join(process.cwd(), 'data', 'missing-translations.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(missingTranslations, null, 2),
      'utf-8'
    );
    console.log(`\n💾 목록 저장: ${outputPath}`);
  }

  console.log(`\n📊 통계:`);
  console.log(`   전체: ${allFiles.length}`);
  console.log(`   번역 있음: ${allFiles.length - missingTranslations.length}`);
  console.log(`   번역 없음: ${missingTranslations.length}`);
}

checkMissingTranslations()
  .then(() => {
    console.log('\n✨ 체크 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 오류:', error);
    process.exit(1);
  });
