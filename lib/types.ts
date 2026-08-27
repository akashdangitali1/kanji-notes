export type HandoutStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';

export interface KanjiEntry {
  char: string;
  onyomi: string; // katakana reading, empty string if none
  kunyomi: string; // hiragana reading, empty string if none
  meaning: string; // short English meaning
  example_word: string; // one word from the handout using this kanji
  example_reading: string; // reading of that word
}

export interface GrammarEntry {
  pattern: string; // e.g. "〜てもいい"
  meaning: string; // plain English explanation
  example_jp: string; // example sentence in Japanese, from the handout if possible
  example_en: string; // English translation of the example
}

export interface VocabEntry {
  word: string;
  reading: string;
  meaning: string;
}

export interface ExtractedContent {
  summary: string; // one or two sentence plain-English summary of the lesson
  level: string | null; // JLPT-style guess, e.g. "N4", null if unclear
  kanji: KanjiEntry[];
  grammar: GrammarEntry[];
  vocabulary: VocabEntry[];
  notes: string; // anything else worth surfacing (cultural notes, exceptions, teacher remarks)
}

export interface Handout {
  id: string;
  title: string;
  class_date: string | null; // ISO date, as reported by uploader
  uploader_name: string | null;
  pdf_path: string; // path inside the Supabase storage bucket
  status: HandoutStatus;
  extracted: ExtractedContent | null;
  error_message: string | null;
  created_at: string;
}
