import * as fs from 'fs';
import * as path from 'path';

interface Essay {
  title: string;
  url: string;
  year?: string;
  content: string;
  scrapedAt: string;
}

function validateEssays(): void {
  console.log('🔍 Starting data validation...\n');

  const rawPath = path.join(process.cwd(), 'data', 'essays-raw.json');

  if (!fs.existsSync(rawPath)) {
    throw new Error('❌ essays-raw.json not found. Please run script 2 first.');
  }

  const essays: Essay[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

  console.log(`📊 Total essays loaded: ${essays.length}\n`);

  // Validation checks
  const issues: string[] = [];
  const stats = {
    total: essays.length,
    valid: 0,
    emptyContent: 0,
    shortContent: 0,
    missingYear: 0,
    duplicates: 0
  };

  const seenUrls = new Set<string>();
  const MIN_CONTENT_LENGTH = 500; // Minimum reasonable essay length

  essays.forEach((essay, index) => {
    let isValid = true;

    // Check for empty content
    if (!essay.content || essay.content.trim().length === 0) {
      issues.push(`Essay #${index + 1} "${essay.title}" has empty content`);
      stats.emptyContent++;
      isValid = false;
    }

    // Check for suspiciously short content
    else if (essay.content.length < MIN_CONTENT_LENGTH) {
      issues.push(`Essay #${index + 1} "${essay.title}" has short content (${essay.content.length} chars)`);
      stats.shortContent++;
    }

    // Check for missing year
    if (!essay.year) {
      stats.missingYear++;
    }

    // Check for duplicates
    if (seenUrls.has(essay.url)) {
      issues.push(`Essay #${index + 1} "${essay.title}" is a duplicate (${essay.url})`);
      stats.duplicates++;
      isValid = false;
    } else {
      seenUrls.add(essay.url);
    }

    if (isValid && essay.content.length >= MIN_CONTENT_LENGTH) {
      stats.valid++;
    }
  });

  // Print validation report
  console.log('📈 Validation Statistics:');
  console.log(`  Total essays: ${stats.total}`);
  console.log(`  ✅ Valid essays: ${stats.valid}`);
  console.log(`  ⚠️  Empty content: ${stats.emptyContent}`);
  console.log(`  📏 Short content: ${stats.shortContent}`);
  console.log(`  📅 Missing year: ${stats.missingYear}`);
  console.log(`  🔄 Duplicates: ${stats.duplicates}`);

  if (issues.length > 0) {
    console.log(`\n⚠️  Found ${issues.length} issues:\n`);
    issues.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
    if (issues.length > 10) {
      console.log(`  ... and ${issues.length - 10} more issues`);
    }
  }

  // Content length distribution
  const contentLengths = essays
    .filter(e => e.content)
    .map(e => e.content.length)
    .sort((a, b) => a - b);

  console.log('\n📊 Content Length Distribution:');
  console.log(`  Min: ${contentLengths[0]?.toLocaleString() || 0} chars`);
  console.log(`  Max: ${contentLengths[contentLengths.length - 1]?.toLocaleString() || 0} chars`);
  console.log(`  Median: ${contentLengths[Math.floor(contentLengths.length / 2)]?.toLocaleString() || 0} chars`);
  console.log(`  Average: ${Math.round(contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length).toLocaleString()} chars`);

  // Sample essays
  console.log('\n📝 Sample Essays:');
  essays.slice(0, 3).forEach((essay, i) => {
    console.log(`\n${i + 1}. ${essay.title} (${essay.year || 'N/A'})`);
    console.log(`   URL: ${essay.url}`);
    console.log(`   Content: ${essay.content.length.toLocaleString()} chars`);
    console.log(`   Preview: ${essay.content.substring(0, 100)}...`);
  });

  // Save validation report
  const report = {
    validatedAt: new Date().toISOString(),
    statistics: stats,
    issues: issues,
    contentLengths: {
      min: contentLengths[0] || 0,
      max: contentLengths[contentLengths.length - 1] || 0,
      median: contentLengths[Math.floor(contentLengths.length / 2)] || 0,
      average: Math.round(contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length) || 0
    }
  };

  const reportPath = path.join(process.cwd(), 'data', 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n💾 Validation report saved to: ${reportPath}`);

  // Exit with error if critical issues found
  if (stats.emptyContent > 0 || stats.duplicates > 0) {
    console.log('\n⚠️  Critical issues found. Please review before proceeding to analysis.');
  } else {
    console.log('\n✅ Data validation passed! Ready for analysis.');
  }
}

// Run the script
try {
  validateEssays();
  console.log('\n✨ Validation completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
}
