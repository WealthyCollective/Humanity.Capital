import type { PitchScore } from "./db.js";

const GENRE_MARKET_DEMAND: Record<string, number> = {
  "Action Thriller": 8,
  "Drama": 7,
  "Documentary": 6,
  "Comedy": 7,
  "Science Fiction": 8,
  "Horror": 6,
  "Romance": 6,
  "Animation": 8,
  "Crime Thriller": 7,
  "Historical": 5,
  "Political Thriller": 6,
  "Romantic Drama": 6,
  "Biopic": 6,
};

const DUBAI_KEYWORDS = ["dubai", "uae", "emirates", "gulf", "desert", "marina", "deira", "creek", "abu dhabi", "sharjah", "burj", "arabian"];
const PROTAGONIST_KEYWORDS = ["protagonist", "hero", "she", "he", "they", "detective", "engineer", "doctor", "soldier", "journalist", "young", "woman", "man", "family"];
const CONFLICT_KEYWORDS = ["must", "battle", "fight", "discover", "uncover", "race", "prevent", "escape", "overcome", "faces", "against", "threat", "danger", "challenge"];
const STAKES_KEYWORDS = ["life", "death", "career", "love", "family", "country", "world", "future", "legacy", "freedom", "justice", "survival", "everything"];

const AUDIENCE_EXPORT_POTENTIAL: Record<string, number> = {
  "International": 9,
  "Global streaming": 9,
  "Regional (MENA)": 6,
  "Family": 7,
  "Young adults (18-34)": 8,
  "Adults (35+)": 7,
  "Children": 6,
};

const FORMAT_MULTIPLIER: Record<string, number> = {
  "Feature Film": 1.0,
  "TV Series": 0.95,
  "Documentary": 0.85,
  "Short Film": 0.7,
  "Web Series": 0.8,
  "Music Video": 0.6,
  "Commercial": 0.5,
};

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k)).length;
}

function scoreClarity(logline: string, synopsis: string): number {
  const combined = `${logline} ${synopsis}`;
  const len = combined.trim().length;
  let score = 5;
  if (len > 100) score += 1;
  if (len > 300) score += 1;
  score += Math.min(2, countKeywords(combined, PROTAGONIST_KEYWORDS));
  score += Math.min(1, countKeywords(combined, CONFLICT_KEYWORDS));
  score += Math.min(1, countKeywords(combined, STAKES_KEYWORDS));
  if (logline.includes("?")) score -= 1; // vague loglines
  return Math.min(10, Math.max(1, score));
}

function scoreMarket(genre: string): number {
  return GENRE_MARKET_DEMAND[genre] ?? 5;
}

function scoreDubaiFit(logline: string, synopsis: string): number {
  const combined = `${logline} ${synopsis}`.toLowerCase();
  const hits = countKeywords(combined, DUBAI_KEYWORDS);
  let base = 5;
  if (hits >= 3) base = 9;
  else if (hits === 2) base = 7;
  else if (hits === 1) base = 6;
  return Math.min(10, base);
}

function scoreExport(targetAudience: string, format: string, genre: string): number {
  const audienceScore = AUDIENCE_EXPORT_POTENTIAL[targetAudience] ?? 6;
  const multiplier = FORMAT_MULTIPLIER[format] ?? 0.8;
  const genreBase = (GENRE_MARKET_DEMAND[genre] ?? 5) / 10;
  const raw = audienceScore * multiplier * (0.7 + genreBase * 0.3);
  return Math.min(10, Math.max(1, Math.round(raw)));
}

const STRENGTH_TEMPLATES = [
  "The logline establishes a clear protagonist with identifiable goals and obstacles.",
  "The genre has demonstrated consistent international market demand over the past three years.",
  "Dubai and UAE locations provide a distinctive visual identity rarely seen in this genre.",
  "The narrative structure shows awareness of international three-act conventions.",
  "A global streaming audience is within reach given the universal themes at the centre of the story.",
  "The production format aligns well with current buyer appetite in the MENA and international co-production market.",
  "Location specificity (Gulf, desert, maritime) gives the project a strong sense of place that can function as a sales asset.",
  "The stated target audience maps to a commercially active demographic on streaming and theatrical platforms.",
];

const RISK_TEMPLATES = [
  "The logline would benefit from a clearer statement of what the protagonist stands to lose if they fail.",
  "Genre saturation in international markets means the project will need a distinctive hook in marketing materials.",
  "Dubai production fit could be strengthened by incorporating more specifically local cultural or architectural elements.",
  "The synopsis does not clearly convey the story's emotional core, which is a key consideration for international buyers.",
  "Audience definition is broad; a more focused target demographic will help with positioning and distribution strategy.",
  "The stated format may face challenges securing theatrical distribution without an established director or cast attachment.",
  "Without a clear statement of the production's unique perspective, it risks being positioned alongside competing projects.",
];

const NEXT_STEPS_TEMPLATES = [
  "Develop a one-page treatment that places the emotional stakes of the protagonist at the centre of the pitch.",
  "Identify two or three comparable titles (comps) released in the past 24 months to anchor international sales conversations.",
  "Submit to the Dubai Media Gateway eligibility checker to confirm rebate qualification and qualifying spend parameters.",
  "Consider attaching an Emirati director or co-director to strengthen local participation credentials and improve rebate eligibility.",
  "Prepare a lookbook of Dubai and UAE locations that can serve as a visual pitch document for co-production partners.",
  "Research the European co-production treaty countries that have active relationships with UAE producers, as this can open additional public funding channels.",
  "Book a producer consultation through the Gateway membership programme to review the financial structure and rebate strategy.",
];

function selectItems<T>(arr: T[], count: number, seed: number): T[] {
  const result: T[] = [];
  let s = seed;
  const used = new Set<number>();
  while (result.length < count && used.size < arr.length) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const idx = Math.abs(s) % arr.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
}

export interface AnalysisResult {
  scores: PitchScore[];
  strengths: string[];
  risks: string[];
  nextSteps: string[];
}

export function analyzeRuleBased(params: {
  logline: string;
  synopsis: string;
  genre: string;
  targetAudience: string;
  format: string;
}): AnalysisResult {
  const { logline, synopsis, genre, targetAudience, format } = params;
  const seed = logline.length * 31 + synopsis.length * 17 + genre.charCodeAt(0);

  const scores: PitchScore[] = [
    { dimension: "Story clarity", score: scoreClarity(logline, synopsis) },
    { dimension: "Market potential", score: scoreMarket(genre) },
    { dimension: "Dubai production fit", score: scoreDubaiFit(logline, synopsis) },
    { dimension: "Global export potential", score: scoreExport(targetAudience, format, genre) },
  ];

  const strengths = selectItems(STRENGTH_TEMPLATES, 3, seed);
  const risks = selectItems(RISK_TEMPLATES, 3, seed + 7);
  const nextSteps = selectItems(NEXT_STEPS_TEMPLATES, 3, seed + 13);

  return { scores, strengths, risks, nextSteps };
}

export async function analyze(params: {
  logline: string;
  synopsis: string;
  genre: string;
  targetAudience: string;
  format: string;
}): Promise<AnalysisResult> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    return analyzeRuleBased(params);
  }
  try {
    const prompt = `You are an expert film industry analyst. Analyze this pitch and return ONLY a JSON object with no extra text:
{
  "scores": [
    {"dimension": "Story clarity", "score": <1-10>},
    {"dimension": "Market potential", "score": <1-10>},
    {"dimension": "Dubai production fit", "score": <1-10>},
    {"dimension": "Global export potential", "score": <1-10>}
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "risks": ["<risk1>", "<risk2>", "<risk3>"],
  "nextSteps": ["<step1>", "<step2>", "<step3>"]
}

Genre: ${params.genre}
Target audience: ${params.targetAudience}
Format: ${params.format}
Logline: ${params.logline}
Synopsis: ${params.synopsis || "(not provided)"}

Scores must be integers 1-10. Strengths/risks/nextSteps must be specific, professional, and concise (one sentence each).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return analyzeRuleBased(params);
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    const text = data.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text) as AnalysisResult;
    return parsed;
  } catch {
    return analyzeRuleBased(params);
  }
}
