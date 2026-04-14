/**
 * Cortex Slash Command Parser — Phase 11B
 * Parses structured slash commands for power users.
 *
 * Examples:
 *   /create blog "Topic" --client X --tone professional --length 1200
 *   /schedule "content-id" --date 2026-06-01 --time 09:00 --platform linkedin
 *   /report --client X --period last-30-days --format pdf
 *   /score --content "text" --type seo,readability,brand
 */

export interface ParsedSlashCommand {
  command: string;
  args: string[];
  flags: Record<string, string>;
  raw: string;
}

const SLASH_COMMANDS: Record<string, { description: string; usage: string }> = {
  create: { description: 'Create content with AI', usage: '/create <type> "topic" --channel linkedin --tone professional' },
  schedule: { description: 'Schedule content for publishing', usage: '/schedule <content-id> --date 2026-06-01 --time 09:00 --platform linkedin' },
  publish: { description: 'Publish content immediately', usage: '/publish <content-id> --platform linkedin' },
  report: { description: 'Generate a performance report', usage: '/report --client X --period last-30-days --format pdf --send email@example.com' },
  score: { description: 'Score content for quality', usage: '/score --draft <id> --type seo,readability,brand,geo' },
  campaign: { description: 'Plan a multi-step campaign', usage: '/campaign --goal "50 leads" --budget 500 --duration 30d --platforms ig,li,email' },
  analyze: { description: 'Analyze performance', usage: '/analyze --client X --metric engagement --compare last-month' },
  translate: { description: 'Translate content', usage: '/translate --draft <id> --to es,fr,de' },
  audit: { description: 'Audit a website', usage: '/audit <url>' },
  sequence: { description: 'Create email sequence', usage: '/sequence --type welcome --topic "new signup"' },
  brief: { description: 'Create content brief', usage: '/brief "topic" --audience "marketers" --keywords seo,content' },
  help: { description: 'Show available commands', usage: '/help' },
};

/**
 * Check if a message is a slash command.
 */
export function isSlashCommand(message: string): boolean {
  return message.trim().startsWith('/') && !message.trim().startsWith('//');
}

/**
 * Parse a slash command string into structured parts.
 */
export function parseSlashCommand(input: string): ParsedSlashCommand {
  const raw = input.trim();
  const parts = raw.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];

  const command = (parts[0] ?? '').replace('/', '');
  const args: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      const key = part.replace('--', '');
      const value = parts[i + 1] && !parts[i + 1].startsWith('--') ? parts[++i].replace(/^"|"$/g, '') : 'true';
      flags[key] = value;
    } else {
      args.push(part.replace(/^"|"$/g, ''));
    }
  }

  return { command, args, flags, raw };
}

/**
 * Convert a parsed slash command into a natural language prompt for Cortex.
 * This bridges structured commands to the AI conversation flow.
 */
export function slashCommandToPrompt(parsed: ParsedSlashCommand): string {
  const { command, args, flags } = parsed;

  switch (command) {
    case 'create':
      return `Create a ${args[0] ?? 'blog post'} about ${args[1] ?? flags.topic ?? 'a topic'}${flags.channel ? ` for ${flags.channel}` : ''}${flags.tone ? ` in a ${flags.tone} tone` : ''}${flags.length ? ` (${flags.length} words)` : ''}.`;

    case 'schedule':
      return `Schedule content ${args[0] ?? flags.draft ?? ''} for ${flags.date ?? 'tomorrow'}${flags.time ? ` at ${flags.time}` : ''} on ${flags.platform ?? 'all platforms'}.`;

    case 'publish':
      return `Publish content ${args[0] ?? flags.draft ?? ''} now on ${flags.platform ?? 'all platforms'}.`;

    case 'report':
      return `Generate a ${flags.format ?? 'performance'} report${flags.client ? ` for client ${flags.client}` : ''} for the ${flags.period ?? 'last 30 days'}${flags.send ? ` and send to ${flags.send}` : ''}.`;

    case 'score':
      return `Score draft ${flags.draft ?? args[0] ?? ''} for ${flags.type ?? 'SEO, readability, brand voice, and GEO'}.`;

    case 'campaign':
      return `Plan a campaign with goal: ${flags.goal ?? 'generate leads'}${flags.budget ? `, budget: ${flags.budget}` : ''}${flags.duration ? `, duration: ${flags.duration}` : ''}${flags.platforms ? ` on ${flags.platforms}` : ''}.`;

    case 'analyze':
      return `Analyze ${flags.metric ?? 'engagement'}${flags.client ? ` for client ${flags.client}` : ''}${flags.compare ? ` compared to ${flags.compare}` : ''}.`;

    case 'translate':
      return `Translate draft ${flags.draft ?? args[0] ?? ''} to ${flags.to ?? 'Spanish'}.`;

    case 'audit':
      return `Run a marketing audit on ${args[0] ?? flags.url ?? 'the website'}.`;

    case 'sequence':
      return `Create a ${flags.type ?? 'welcome'} email sequence about ${flags.topic ?? args[0] ?? 'the topic'}.`;

    case 'brief':
      return `Create a content brief for "${args[0] ?? flags.topic ?? 'the topic'}"${flags.audience ? ` targeting ${flags.audience}` : ''}${flags.keywords ? ` with keywords: ${flags.keywords}` : ''}.`;

    case 'help':
      return 'Show me all available slash commands and how to use them.';

    default:
      return parsed.raw;
  }
}

/**
 * Get help text for all slash commands.
 */
export function getSlashCommandHelp(): string {
  return Object.entries(SLASH_COMMANDS)
    .map(([cmd, info]) => `\`/${cmd}\` — ${info.description}\n  Usage: \`${info.usage}\``)
    .join('\n\n');
}

/**
 * Get autocomplete suggestions for partially typed commands.
 */
export function getSlashCommandSuggestions(partial: string): string[] {
  const input = partial.replace('/', '').toLowerCase();
  if (!input) return Object.keys(SLASH_COMMANDS).map((c) => `/${c}`);
  return Object.keys(SLASH_COMMANDS)
    .filter((c) => c.startsWith(input))
    .map((c) => `/${c}`);
}
