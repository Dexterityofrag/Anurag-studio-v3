/* ──────────────────────────────────────────────────────────────
   "Ask AI about me" — shared prompt + provider deep links.

   Nothing here calls an AI API. The button opens the visitor's own
   assistant with a research question already typed. The assistant does
   its own looking; /llms.txt, the sitemap and the Person schema are what
   it finds when it gets there. Zero cost, and the answer is the
   assistant's own, which is the only kind anyone believes.
   ────────────────────────────────────────────────────────────── */

export const SITE_URL = 'https://anurag.studio'
export const LLMS_TXT_URL = `${SITE_URL}/llms.txt`

/**
 * The prompt handed to whichever assistant the visitor picks.
 *
 * Deliberately an open research question, not "read this page". An answer the
 * assistant found on its own reads as a verdict; an answer it was handed reads
 * as a press release. /llms.txt still exists — it is what the assistant will
 * find once it goes looking, which is the whole point of publishing it.
 */
export const ASK_AI_PROMPT = [
  'Who is Anurag Adhikari, the product designer and creative developer behind anurag.studio?',
  '',
  'Look him up and tell me what he actually works on, the projects he has shipped, how he thinks about design, and what he would be worth hiring for. Be honest about where he is in his career.',
  '',
  'Cite what you find, and say so plainly if something is thin or you cannot verify it.',
].join('\n')

export type AskAiProvider = {
  id: string
  name: string
  /** Two-letter mark for the chip — initials alone collide (ChatGPT/Claude, Grok/Gemini). */
  mark: string
  /** Builds the deep link. Undefined = the site cannot pre-fill; copy instead. */
  href: (prompt: string) => string
  /** True when the prompt must be pasted by hand after the tab opens. */
  needsPaste?: boolean
}

export const ASK_AI_PROVIDERS: AskAiProvider[] = [
  {
    id: 'chatgpt',
    mark: 'GP',
    name: 'ChatGPT',
    href: (p) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(p)}`,
  },
  {
    id: 'claude',
    mark: 'CL',
    name: 'Claude',
    href: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    id: 'perplexity',
    mark: 'PX',
    name: 'Perplexity',
    href: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    id: 'grok',
    mark: 'GR',
    name: 'Grok',
    href: (p) => `https://grok.com/?q=${encodeURIComponent(p)}`,
  },
  {
    // Gemini has no documented prompt parameter, so the prompt goes to the
    // clipboard and the visitor pastes it into the composer.
    id: 'gemini',
    mark: 'GM',
    name: 'Gemini',
    href: () => 'https://gemini.google.com/app',
    needsPaste: true,
  },
]
