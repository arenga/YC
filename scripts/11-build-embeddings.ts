import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

type EssayDoc = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  content: string;
};

type EmbeddingItem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  chunk: string;
  essayPath: string;
  position: number;
  embedding: number[];
};

const ROOT = path.resolve(__dirname, "..");
const ESSAY_DIR = path.join(ROOT, "blog", "_essays");
const OUT_DIR = path.join(ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "embeddings.jsonl");

const CHUNK_SIZE = 800; // characters
const CHUNK_OVERLAP = 150;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function main() {
  const apiKey = getEnv("OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  await fs.promises.mkdir(OUT_DIR, { recursive: true });
  const files = await walkMarkdown(ESSAY_DIR);

  const out = fs.createWriteStream(OUT_FILE, { flags: "w" });

  for (const file of files) {
    const doc = await parseEssay(file);
    const chunks = chunkText(doc.content, CHUNK_SIZE, CHUNK_OVERLAP);

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const id = `${doc.id}#${idx}`;
      const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      const item: EmbeddingItem = {
        id,
        title: doc.title,
        category: doc.category,
        difficulty: doc.difficulty,
        chunk,
        essayPath: path.relative(ROOT, file),
        position: idx,
        embedding: res.data[0].embedding,
      };

      out.write(JSON.stringify(item) + "\n");
      process.stdout.write(".");
    }
    process.stdout.write(`\n✔ embedded ${doc.title}\n`);
  }

  out.end();
  console.log(`\nSaved to ${path.relative(ROOT, OUT_FILE)}`);
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walkMarkdown(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      result.push(full);
    }
  }
  return result;
}

async function parseEssay(file: string): Promise<EssayDoc> {
  const raw = await fs.promises.readFile(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const meta: Record<string, string> = {};
  let inFrontMatter = false;
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") {
      inFrontMatter = !inFrontMatter;
      continue;
    }
    if (inFrontMatter) {
      const m = line.match(/^(\w+):\s*"?(.+?)"?$/);
      if (m) meta[m[1]] = m[2];
    } else {
      bodyStart = i;
      break;
    }
  }

  const content = lines.slice(bodyStart).join("\n");

  return {
    id: meta.slug ?? path.basename(file, ".md"),
    title: meta.title ?? path.basename(file, ".md"),
    category: meta.category ?? "",
    difficulty: meta.difficulty ?? "",
    content,
  };
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks.filter(Boolean);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
