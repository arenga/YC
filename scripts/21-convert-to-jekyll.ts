import * as fs from 'fs';
import * as path from 'path';

interface EssayMetadata {
  title: string;
  category: string;
  difficulty: string;
  year: string;
  url: string;
}

function parseEssayFile(filePath: string): { metadata: EssayMetadata; content: string } {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');

  // Extract metadata from the first few lines
  let title = '';
  let category = '';
  let difficulty = '';
  let year = '';
  let url = '';
  let contentStartIndex = 0;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
    } else if (line.startsWith('**카테고리**:')) {
      category = line.replace('**카테고리**:', '').trim();
    } else if (line.startsWith('**난이도**:')) {
      difficulty = line.replace('**난이도**:', '').trim();
    } else if (line.startsWith('**출판일**:')) {
      year = line.replace('**출판일**:', '').trim();
    } else if (line.startsWith('**원문**:')) {
      url = line.replace('**원문**:', '').trim();
    } else if (line.startsWith('---') && i > 0) {
      contentStartIndex = i + 1;
      break;
    }
  }

  // Get content after metadata section
  const content = lines.slice(contentStartIndex).join('\n').trim();

  return {
    metadata: { title, category, difficulty, year, url },
    content
  };
}

function generateJekyllFrontMatter(metadata: EssayMetadata): string {
  const { title, category, difficulty, year, url } = metadata;

  return `---
layout: essay
title: "${title.replace(/"/g, '\\"')}"
category: ${category}
difficulty: ${difficulty}
year: ${year === 'N/A' ? '' : year}
url_original: "${url}"
---
`;
}

function convertEssayToJekyll(sourcePath: string, targetPath: string): void {
  const { metadata, content } = parseEssayFile(sourcePath);
  const frontMatter = generateJekyllFrontMatter(metadata);
  const jekyllContent = frontMatter + '\n' + content;

  fs.writeFileSync(targetPath, jekyllContent, 'utf-8');
}

async function convertAllEssays() {
  console.log('🚀 Jekyll 형식 변환 시작...\n');

  const essaysDir = path.join(process.cwd(), 'essays');
  const targetDir = path.join(process.cwd(), 'blog', '_essays');

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Find all markdown files
  function findMarkdownFiles(dir: string): string[] {
    const files: string[] = [];

    function traverse(currentDir: string) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.md') && !item.includes('README')) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  const allFiles = findMarkdownFiles(essaysDir);
  console.log(`📚 총 ${allFiles.length}개 에세이 발견\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const sourcePath = allFiles[i];
    const relativePath = sourcePath.replace(essaysDir + '/', '');
    const filename = path.basename(sourcePath);

    try {
      const targetPath = path.join(targetDir, filename);
      convertEssayToJekyll(sourcePath, targetPath);

      successCount++;
      console.log(`[${i + 1}/${allFiles.length}] ✅ ${filename}`);
    } catch (error: any) {
      errorCount++;
      console.error(`[${i + 1}/${allFiles.length}] ❌ ${filename}: ${error.message}`);
    }
  }

  console.log(`\n📊 변환 완료:`);
  console.log(`   성공: ${successCount}개`);
  console.log(`   실패: ${errorCount}개`);
  console.log(`\n💾 저장 위치: ${targetDir}`);
}

convertAllEssays()
  .then(() => {
    console.log('\n✨ 변환 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 오류:', error);
    process.exit(1);
  });
