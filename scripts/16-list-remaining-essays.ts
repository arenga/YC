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

// 10개 샘플 에세이 목록
const completedEssays = [
  'How to Do Great Work',
  'Having Kids',
  'How to Lose Time and Money',
  'Founder Mode',
  'The Shape of the Essay Field',
  'Good Writing',
  'What to Do',
  'The Origins of Wokeness',
  'Writes and Write-Nots',
  'When To Do What You Love'
];

async function listRemainingEssays() {
  const analyzedPath = path.join(process.cwd(), 'data', 'essays-analyzed.json');
  const essays: AnalyzedEssay[] = JSON.parse(fs.readFileSync(analyzedPath, 'utf-8'));

  const remaining = essays.filter(essay => !completedEssays.includes(essay.title));

  console.log(`📚 Total essays: ${essays.length}`);
  console.log(`✅ Completed: ${completedEssays.length}`);
  console.log(`⏳ Remaining: ${remaining.length}\n`);

  // Group by category and difficulty
  const grouped: Record<string, Record<string, string[]>> = {};

  remaining.forEach(essay => {
    const category = essay.analysis.primaryCategory;
    const difficulty = essay.analysis.difficulty;

    if (!grouped[category]) grouped[category] = {};
    if (!grouped[category][difficulty]) grouped[category][difficulty] = [];

    grouped[category][difficulty].push(essay.title);
  });

  console.log('📊 Remaining essays by category:\n');

  Object.entries(grouped).forEach(([category, difficulties]) => {
    const total = Object.values(difficulties).flat().length;
    console.log(`\n${category} (${total} essays):`);

    Object.entries(difficulties).forEach(([difficulty, titles]) => {
      console.log(`  ${difficulty}: ${titles.length} essays`);
    });
  });

  // Save to file for reference
  const outputPath = path.join(process.cwd(), 'data', 'remaining-essays.json');
  fs.writeFileSync(outputPath, JSON.stringify(remaining, null, 2), 'utf-8');
  console.log(`\n💾 Saved remaining essays to: ${outputPath}`);
}

listRemainingEssays()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
