/**
 * Sentiment Analysis Service
 * Uses Claude Haiku when API key is set, VADER-like rules for free tier.
 */

export function analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } {
  const lower = text.toLowerCase();

  // Simple rule-based sentiment (VADER-like) for dev/free tier
  const positiveWords = ['love', 'great', 'amazing', 'awesome', 'excellent', 'fantastic', 'wonderful', 'best', 'happy', 'thank', 'beautiful', 'perfect', 'impressive', 'brilliant', '❤️', '🔥', '👏', '😍', '🎉', '💯'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'bad', 'disappointed', 'poor', 'annoying', 'broken', 'angry', 'frustrated', 'disgusting', 'useless', '😡', '👎', '😤'];

  let score = 0;
  for (const word of positiveWords) {
    if (lower.includes(word)) score += 0.15;
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) score -= 0.2;
  }

  // Clamp to -1 to 1
  score = Math.max(-1, Math.min(1, score));

  const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  return { sentiment, score: Math.round(score * 100) / 100 };
}

/**
 * Batch analyze sentiment for multiple texts.
 */
export function batchAnalyzeSentiment(texts: string[]): { sentiment: string; score: number }[] {
  return texts.map(analyzeSentiment);
}
