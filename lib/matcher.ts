import { INDEX } from "./datasets";

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function scoreItem(query: string, tokens: string[], keywords: string[]): number {
  let score = 0;
  for (const raw of keywords) {
    const kw = raw.toLowerCase().trim();
    if (!kw) continue;
    if (query.includes(kw)) {
      score += kw.split(/\s+/).length * 3;
    } else {
      const overlap = kw.split(/\s+/).filter((w) => tokens.includes(w)).length;
      score += overlap;
    }
  }
  return score;
}

export function answerQuery(message: string) {
  const query = message.toLowerCase().trim();
  const tokens = tokenize(message);

  let best: { unit: any; score: number } = { unit: null, score: 0 };
  for (const unit of INDEX) {
    const s = scoreItem(query, tokens, unit.keywords);
    if (s > best.score) best = { unit, score: s };
  }

  if (!best.unit || best.score < 2) {
    return {
      reply: "I'm not sure about that yet. Try asking about the timetable, faculty, exam dates, clubs, campus rules, or food on campus.",
      source: "fallback",
      matched: false,
      data: null,
    };
  }

  return { reply: best.unit.reply, source: best.unit.category, matched: true, data: best.unit.data };
}