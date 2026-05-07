// Single source of truth for the "guides" content cluster — used by the
// /tips hub page (renders a card grid) and by the RelatedGuides component
// (renders cross-links at the bottom of each guide). Cross-link changes
// happen here once.

export interface Guide {
  slug: string;
  title: string;
  description: string;
  summary: string;
}

export const GUIDES: readonly Guide[] = [
  {
    slug: '/tips',
    title: 'Tips overview',
    description:
      'Practical techniques to improve typing speed and accuracy: touch typing, home row, accuracy first, rhythm, the bigram bottleneck, multilingual practice, and how to read your results.',
    summary:
      'The high-leverage habits that move you from 50 to 100 WPM — accuracy, rhythm, bigrams, hardware that matters, reading your results.',
  },
  {
    slug: '/touch-typing-fundamentals',
    title: 'Touch typing fundamentals',
    description:
      'A start-to-finish primer on touch typing: home row, finger zones, posture, beginner drills, common mistakes, and how to avoid RSI as you build the habit.',
    summary:
      'Hand position, finger zones, posture, beginner drills, and how to avoid RSI as you build the habit.',
  },
  {
    slug: '/keyboard-layouts',
    title: 'Keyboard layouts compared',
    description:
      'An honest look at QWERTY, Dvorak, Colemak, Workman, and AZERTY. Layout history, ergonomic claims vs. evidence, and whether switching is worth the cost.',
    summary:
      'QWERTY, Dvorak, Colemak, Workman, AZERTY — what each layout actually buys you, and whether switching is worth the cost.',
  },
  {
    slug: '/practice-routines',
    title: 'Practice routines that work',
    description:
      'Deliberate-practice protocols for 10-, 30-, and 60-minute sessions. Weekly progression, plateau breakers, and how to track real improvement.',
    summary:
      'Deliberate-practice protocols, weekly progression, plateau breakers, and how to track real improvement instead of chasing a personal-best WPM.',
  },
];
