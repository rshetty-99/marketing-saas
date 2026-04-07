/**
 * Blog Content Sanitizer
 * Whitelist-based HTML sanitization for blog content and comments.
 * Prevents XSS from Tiptap editor output and user comments.
 */

// Allowed HTML tags for blog content (from Tiptap editor)
const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 's',
  'a', 'img', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'br', 'hr', 'span', 'div', 'figure', 'figcaption',
]);

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  span: new Set(['class']),
  div: new Set(['class']),
  code: new Set(['class']),
  pre: new Set(['class']),
};

// Dangerous patterns to strip
const DANGEROUS_PATTERNS = [
  /<script[\s>][\s\S]*?<\/script>/gi,
  /<iframe[\s>][\s\S]*?<\/iframe>/gi,
  /<object[\s>][\s\S]*?<\/object>/gi,
  /<embed[\s>][\s\S]*?>/gi,
  /<form[\s>][\s\S]*?<\/form>/gi,
  /<input[\s>][\s\S]*?>/gi,
  /<textarea[\s>][\s\S]*?<\/textarea>/gi,
  /<select[\s>][\s\S]*?<\/select>/gi,
  /<button[\s>][\s\S]*?<\/button>/gi,
  /<style[\s>][\s\S]*?<\/style>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
];

/**
 * Sanitize HTML content from the Tiptap editor.
 * Strips dangerous tags/attributes while preserving safe formatting.
 */
export function sanitizeHtml(html: string): string {
  let clean = html;

  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (match.startsWith('</')) return `</${tag}>`;

    const allowedAttrs = ALLOWED_ATTRS[tag];
    if (!allowedAttrs) {
      return match.endsWith('/>') ? `<${tag} />` : `<${tag}>`;
    }

    const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    const attrs: string[] = [];
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
      if (allowedAttrs.has(attrName)) {
        if (attrName === 'href' || attrName === 'src') {
          if (/^(https?:\/\/|\/|#|mailto:)/i.test(attrValue)) {
            attrs.push(`${attrName}="${attrValue}"`);
          }
        } else {
          attrs.push(`${attrName}="${attrValue}"`);
        }
      }
    }

    if (tag === 'a') {
      if (!attrs.some((a) => a.startsWith('rel='))) attrs.push('rel="noopener noreferrer"');
      if (!attrs.some((a) => a.startsWith('target='))) attrs.push('target="_blank"');
    }
    if (tag === 'img' && !attrs.some((a) => a.startsWith('loading='))) {
      attrs.push('loading="lazy"');
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    return match.endsWith('/>') ? `<${tag}${attrStr} />` : `<${tag}${attrStr}>`;
  });

  return clean.trim();
}

/**
 * Sanitize a plain-text comment. Strips ALL HTML.
 */
export function sanitizeComment(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
}

/**
 * Calculate word count from HTML content.
 */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

/**
 * Calculate read time in minutes (200 words/min average).
 */
export function calculateReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Generate a URL-safe slug from a title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
