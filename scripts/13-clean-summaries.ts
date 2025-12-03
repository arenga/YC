import * as fs from 'fs';
import * as path from 'path';

async function cleanMarkdownFile(filepath: string): Promise<void> {
  const content = fs.readFileSync(filepath, 'utf-8');

  // Summary 섹션 다음에 오는 모든 중복 섹션 제거
  // Summary 섹션은 --- 로 끝나야 하고, 그 다음은 바로 ## 핵심 포인트 (Key Takeaways) 섹션이어야 함

  // 패턴: Summary 섹션 끝(---) 부터 ## 핵심 포인트 (Key Takeaways) 전까지의 모든 내용 제거
  const cleanedContent = content.replace(
    /(## 요약 \(Summary\)[\s\S]*?\n\n---)\n\n[\s\S]*?(?=\n## 핵심 포인트 \(Key Takeaways\))/,
    '$1\n'
  );

  fs.writeFileSync(filepath, cleanedContent, 'utf-8');
}

async function cleanAllFiles() {
  console.log('🧹 Summary 섹션 정리 시작...\n');

  const essaysDir = path.join(process.cwd(), 'essays');
  let cleanedCount = 0;

  function processDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.md')) {
        try {
          cleanMarkdownFile(fullPath);
          cleanedCount++;
          if (cleanedCount % 50 === 0) {
            console.log(`✅ ${cleanedCount}개 파일 정리 완료...`);
          }
        } catch (error: any) {
          console.error(`❌ Error cleaning ${fullPath}:`, error.message);
        }
      }
    }
  }

  processDirectory(essaysDir);

  console.log(`\n✅ 총 ${cleanedCount}개 파일 정리 완료!`);
}

cleanAllFiles()
  .then(() => {
    console.log('\n✨ Summary 섹션 정리 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
