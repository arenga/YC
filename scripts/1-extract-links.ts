import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';

interface EssayLink {
  title: string;
  url: string;
  year?: string;
}

async function extractEssayLinks(): Promise<void> {
  console.log('🚀 Starting essay link extraction from paulgraham.com...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to Paul Graham's articles page
    console.log('📡 Navigating to https://paulgraham.com/articles.html');
    await page.goto('https://paulgraham.com/articles.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Get page content
    const html = await page.content();

    // Parse with Cheerio
    const $ = load(html);
    const essays: EssayLink[] = [];

    // Extract all essay links
    // Paul Graham's articles page has links in <a> tags
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();

      // Filter out navigation links and only keep essay links
      if (href && href.endsWith('.html') && href !== 'articles.html' && text) {
        const url = href.startsWith('http')
          ? href
          : `https://paulgraham.com/${href}`;

        essays.push({
          title: text,
          url: url,
          year: extractYear(text)
        });
      }
    });

    console.log(`✅ Found ${essays.length} essay links\n`);

    // Save to JSON file
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'essay-links.json');
    fs.writeFileSync(outputPath, JSON.stringify(essays, null, 2), 'utf-8');

    console.log(`💾 Saved ${essays.length} links to ${outputPath}`);
    console.log('\n📊 Sample links:');
    essays.slice(0, 5).forEach(essay => {
      console.log(`  - ${essay.title} (${essay.year || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Error extracting links:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

function extractYear(text: string): string | undefined {
  // Try to extract year from text like "Title, Month Year"
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : undefined;
}

// Run the script
extractEssayLinks()
  .then(() => {
    console.log('\n✨ Link extraction completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
