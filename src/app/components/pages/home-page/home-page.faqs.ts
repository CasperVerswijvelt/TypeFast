export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQS: FaqEntry[] = [
  {
    question: 'How is words-per-minute calculated?',
    answer:
      'By the standard convention, one "word" equals five characters. WPM is the number of correctly typed characters divided by five, divided by the elapsed time in minutes. The how-it-works page covers the full breakdown.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'Eighteen: Arabic, Catalan, Chinese, Dutch, English (American and British), French, German, Hindi, Hungarian, Indonesian, Italian, Japanese, Korean, Portuguese, Romanian, Russian, Spanish, and Uyghur. There is also a programming mode that focuses on the keywords and punctuation often found across programming languages.',
  },
  {
    question: 'Can I use my own word list?',
    answer:
      'Yes. Load any plain-text file in the preferences and the test will run against your own content — useful for studying vocabulary, drilling code snippets, or warming up on material you actually need to type.',
  },
  {
    question: 'Does TypeFast store my typing data?',
    answer:
      'No. Your preferences are saved in your browser’s local storage and your typing input is processed locally. The privacy page covers exactly which third parties see what.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. There is no signup, no profile, and nothing to remember. Open the site and start typing.',
  },
  {
    question: 'Does TypeFast work on mobile?',
    answer:
      'The layout works on phones and tablets, but typing tests are best taken on a physical keyboard. Touch input is supported but does not reflect realistic typing speeds.',
  },
];
