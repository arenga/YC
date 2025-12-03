import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { load } from 'cheerio';

interface EssayLink {
  title: string;
  url: string;
  year?: string;
}

interface Essay extends EssayLink {
  content: string;
  scrapedAt: string;
}

const RATE_LIMIT_DELAY = 2500; // 2.5 seconds between requests
const MAX_RETRIES = 3;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeEssay(url: string, page: any, retries = 0): Promise<string | null> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    const $ = load(html);

    // Remove script and style tags
    $('script, style, nav, header, footer').remove();

    // Extract main content - Paul Graham's essays are typically in <table> or <font> tags
    let content = '';

    // Try different selectors for content
    const body = $('body').text();
    content = body.trim();

    // Clean up excessive whitespace
    content = content.replace(/\s+/g, ' ').trim();

    return content;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`  ⚠️  Retry ${retries + 1}/${MAX_RETRIES} for ${url}`);
      await delay(RATE_LIMIT_DELAY * 2); // Longer delay on retry
      return scrapeEssay(url, page, retries + 1);
    }
    console.error(`  ❌ Failed to scrape ${url}:`, error);
    return null;
  }
}

async function scrapeAllEssays(): Promise<void> {
  console.log('🚀 Starting essay scraping process...\n');

  // Load essay links
  const linksPath = path.join(process.cwd(), 'data', 'essay-links.json');
  if (!fs.existsSync(linksPath)) {
    throw new Error('❌ essay-links.json not found. Please run script 1 first.');
  }

  const links: EssayLink[] = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
  console.log(`📚 Found ${links.length} essays to scrape\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set user agent to be respectful
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Educational Research Bot'
  });

  const essays: Essay[] = [];
  const logPath = path.join(process.cwd(), 'data', 'scraping-progress.log');
  const logStream = fs.createWriteStream(logPath, { flags: 'w' });

  try {
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const progress = `[${i + 1}/${links.length}]`;

      console.log(`${progress} Scraping: ${link.title}`);
      logStream.write(`${new Date().toISOString()} ${progress} ${link.title}\n`);

      const content = await scrapeEssay(link.url, page);

      if (content) {
        essays.push({
          ...link,
          content,
          scrapedAt: new Date().toISOString()
        });

        console.log(`  ✅ Success (${content.length} chars)`);
      } else {
        console.log(`  ⚠️  Skipped (failed after retries)`);
      }

      // Rate limiting - be respectful
      if (i < links.length - 1) {
        await delay(RATE_LIMIT_DELAY);
      }
    }

    // Save scraped essays
    const outputPath = path.join(process.cwd(), 'data', 'essays-raw.json');
    fs.writeFileSync(outputPath, JSON.stringify(essays, null, 2), 'utf-8');

    console.log(`\n✅ Scraping complete!`);
    console.log(`📊 Successfully scraped: ${essays.length}/${links.length} essays`);
    console.log(`💾 Saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  } finally {
    logStream.end();
    await browser.close();
  }
}

// Run the script
scrapeAllEssays()
  .then(() => {
    console.log('\n✨ Essay scraping completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
