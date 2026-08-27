import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedContent } from './types';

// We send the PDF file itself (not pre-converted images) — Gemini's multimodal
// models read PDF pages as images internally, which works well even for
// photographed/scanned handouts with messy handwriting or low contrast,
// because we can push it to look harder in the prompt below.
const MODEL_NAME = 'gemini-3.6-flash';

const EXTRACTION_PROMPT = `You are helping a Japanese language student archive a class handout.
The attached PDF may be a clean scan OR a messy phone photo of a handwritten/printed page —
some text may be faint, tilted, or partially cut off. Do your best to read it carefully,
including handwritten annotations, before giving up on a section.

Extract the content into the exact JSON shape described below. Rules:
- Only include kanji, grammar patterns, and vocabulary that actually appear on this handout.
  Do not invent extra ones just to fill the list.
- If a section genuinely has nothing on the handout, return an empty array for it — don't guess.
- Readings must be in kana (hiragana for kunyomi/word readings, katakana for onyomi).
- "level" should be your best guess at JLPT level (N5–N1) based on vocabulary/grammar difficulty,
  or null if you can't tell.
- "summary" is 1-2 plain English sentences on what the lesson covers.
- "notes" can hold anything else useful: teacher's handwritten comments, corrections, cultural asides.
  Use an empty string if there's nothing extra.
- Respond with ONLY raw JSON matching this TypeScript type — no markdown fences, no commentary:

{
  "summary": string,
  "level": string | null,
  "kanji": { "char": string, "onyomi": string, "kunyomi": string, "meaning": string, "example_word": string, "example_reading": string }[],
  "grammar": { "pattern": string, "meaning": string, "example_jp": string, "example_en": string }[],
  "vocabulary": { "word": string, "reading": string, "meaning": string }[],
  "notes": string
}`;

export async function extractFromPdf(pdfBuffer: Buffer): Promise<ExtractedContent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.2, // low temperature: we want faithful reading, not creative filling-in
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent([
    { text: EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBuffer.toString('base64'),
      },
    },
  ]);

  const text = result.response.text();

  let parsed: ExtractedContent;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Gemini returned non-JSON output, the scan may be too unclear to read reliably. Raw output started with: ${text.slice(0, 200)}`
    );
  }

  // Defensive defaults in case the model omits a field
  return {
    summary: parsed.summary ?? '',
    level: parsed.level ?? null,
    kanji: parsed.kanji ?? [],
    grammar: parsed.grammar ?? [],
    vocabulary: parsed.vocabulary ?? [],
    notes: parsed.notes ?? '',
  };
}
