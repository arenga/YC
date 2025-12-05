import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

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

let EMBEDDINGS: EmbeddingItem[] | null = null;
let SYSTEM_PROMPT: string | null = null;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function loadEmbeddings(): EmbeddingItem[] {
  if (EMBEDDINGS) return EMBEDDINGS;
  const file = path.join(process.cwd(), "data", "embeddings.jsonl");
  if (!fs.existsSync(file)) {
    throw new Error(`Embeddings file not found: ${file}. Run npm run build:embeddings`);
  }
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  EMBEDDINGS = lines.map((line) => JSON.parse(line));
  return EMBEDDINGS;
}

function loadSystemPrompt(): string {
  if (SYSTEM_PROMPT) return SYSTEM_PROMPT;
  const promptPath = path.join(process.cwd(), "philosophy", "prompts.md");
  SYSTEM_PROMPT = fs.existsSync(promptPath)
    ? fs.readFileSync(promptPath, "utf8")
    : "You are a concise YC-style advisor. Be direct, practical, and action-focused.";
  return SYSTEM_PROMPT;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

async function search(query: string, client: OpenAI, topK = 4): Promise<EmbeddingItem[]> {
  const embeddings = loadEmbeddings();
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryVec = res.data[0].embedding;

  const scored = embeddings
    .map((item) => ({
      item,
      score: cosine(queryVec, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.item);

  return scored;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = requireEnv("OPENAI_API_KEY");
    const client = new OpenAI({ apiKey });
    const body = req.body || {};
    const userMessage = body.messages?.slice(-1)?.[0]?.content;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "messages array with user content is required" });
    }

    const system = loadSystemPrompt();
    const contexts = await search(userMessage, client, 4);
    const contextText = contexts
      .map(
        (c, idx) =>
          `[${idx + 1}] ${c.title} (${c.category}/${c.difficulty})\n${c.chunk.trim()}`,
      )
      .join("\n\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        {
          role: "system",
          content: `컨텍스트를 참고해 한국어로 간결하게 답변하세요. 실행 항목(2~3개), 근거(에세이명/철학) 포함. 확정할 수 없는 법/세무/의료는 상담 권고.
          
          컨텍스트:
${contextText}`,
        },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "응답을 생성하지 못했습니다.";
    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
