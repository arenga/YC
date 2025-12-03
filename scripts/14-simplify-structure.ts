import * as fs from 'fs';
import * as path from 'path';

async function simplifyMarkdownFile(filepath: string): Promise<void> {
  const content = fs.readFileSync(filepath, 'utf-8');

  // 파일 구조에서 헤더, 요약, 한국어 번역, 원문만 추출
  const lines = content.split('\n');

  let newContent: string[] = [];
  let inSummary = false;
  let inKoreanTranslation = false;
  let inOriginal = false;
  let keepSection = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 헤더 정보 (제목, 카테고리, 난이도 등) - 항상 유지
    if (i < 10 && (line.startsWith('#') || line.startsWith('**') || line === '---')) {
      newContent.push(line);
      continue;
    }

    // 요약 섹션 시작
    if (line.match(/^## 요약 \(Summary\)/)) {
      inSummary = true;
      inKoreanTranslation = false;
      inOriginal = false;
      keepSection = true;
      newContent.push(line);
      continue;
    }

    // 한국어 번역 섹션 시작
    if (line.match(/^## 한국어 번역/)) {
      inSummary = false;
      inKoreanTranslation = true;
      inOriginal = false;
      keepSection = true;
      newContent.push('');
      newContent.push(line);
      continue;
    }

    // 원문 섹션 시작
    if (line.match(/^## 원문 \(Original\)/)) {
      inSummary = false;
      inKoreanTranslation = false;
      inOriginal = true;
      keepSection = true;
      newContent.push('');
      newContent.push(line);
      continue;
    }

    // 다른 섹션 시작 (제거할 섹션)
    if (line.match(/^## /) &&
        !line.match(/^## 요약/) &&
        !line.match(/^## 한국어 번역/) &&
        !line.match(/^## 원문/)) {
      keepSection = false;
      continue;
    }

    // 현재 유지할 섹션에 있으면 라인 추가
    if (keepSection && (inSummary || inKoreanTranslation || inOriginal)) {
      newContent.push(line);
    }
  }

  // 파일 저장
  fs.writeFileSync(filepath, newContent.join('\n'), 'utf-8');
}

async function simplifyAllFiles() {
  console.log('🧹 마크다운 파일 구조 단순화 시작...\n');
  console.log('유지할 섹션: 요약, 한국어 번역, 원문\n');

  const essaysDir = path.join(process.cwd(), 'essays');
  let processedCount = 0;

  function processDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.md')) {
        try {
          simplifyMarkdownFile(fullPath);
          processedCount++;
          if (processedCount % 50 === 0) {
            console.log(`✅ ${processedCount}개 파일 처리 완료...`);
          }
        } catch (error: any) {
          console.error(`❌ Error processing ${fullPath}:`, error.message);
        }
      }
    }
  }

  processDirectory(essaysDir);

  console.log(`\n✅ 총 ${processedCount}개 파일 처리 완료!`);
}

simplifyAllFiles()
  .then(() => {
    console.log('\n✨ 파일 구조 단순화 완료!');
    console.log('남은 섹션: 헤더 정보, 요약, 한국어 번역, 원문');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
